<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\{Budget, Project};
use App\Services\SupabaseStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
 
class ProjectController extends Controller
{
    private function rules(?Project $project = null): array
    {
        $hasImages = $project && ($project->image_path || $project->media()->where('type', 'image')->exists());
        $today = now('Asia/Manila')->toDateString();

        return [
            'budget_id' => 'required|exists:budgets,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'amount_allocated' => 'required|numeric|min:0',
            'contractor' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Planned,Ongoing,Completed,Delayed',
            'progress_notes' => 'nullable|string',
            'start_date' => 'required|date|after_or_equal:'.$today,
            'target_end_date' => 'required|date|after_or_equal:'.$today.'|after_or_equal:start_date',
            'actual_end_date' => ['nullable', 'date', 'after_or_equal:'.$today, 'after_or_equal:start_date', Rule::requiredIf(fn () => request('status') === 'Completed')],
            'images' => $hasImages ? 'nullable|array' : 'required|array|min:1',
            'images.*' => 'image|max:4096',
            'progress_photos' => 'nullable|array',
            'progress_photos.*' => 'image|max:4096',
            'remove_image_ids' => 'sometimes|array',
            'remove_image_ids.*' => ['integer', 'distinct', Rule::exists('project_media', 'id')->where(fn ($q) => $q->where('project_id', $project?->id ?? 0)->where('type', 'image'))],
            'remove_progress_photo_ids' => 'sometimes|array',
            'remove_progress_photo_ids.*' => ['integer', 'distinct', Rule::exists('project_media', 'id')->where(fn ($q) => $q->where('project_id', $project?->id ?? 0)->where('type', 'progress_photo'))],
            'remove_legacy_image' => 'sometimes|boolean',
            'remove_legacy_progress_photo' => 'sometimes|boolean',
        ];
    }
 
    /** Budget cap: sum of project allocations may not exceed the budget. */
    private function overBudget(array $data, ?Project $ignore = null): ?string
    {
        $budget = Budget::find($data['budget_id']);
        $others = $budget->projects()->when($ignore, fn ($q) => $q->where('id', '!=', $ignore->id))->sum('amount_allocated');
        if ($others + $data['amount_allocated'] > $budget->amount_allocated) {
            $left = $budget->amount_allocated - $others;
            return 'Only ₱'.number_format(max($left, 0), 2).' is left in this budget.';
        }
        return null;
    }
 
    private function files(Request $r, array $data, Project $p): array
    {
        $storage = app(SupabaseStorageService::class);
        foreach (['images' => ['image', 'image_path'], 'progress_photos' => ['progress_photo', 'progress_photo_path']] as $field => [$type, $legacyColumn]) {
            foreach ($r->file($field, []) as $file) {
                $path = $storage->upload($file, 'projects');
                $p->media()->create(['type' => $type, 'path' => $path]);
                if (!$p->$legacyColumn && !isset($data[$legacyColumn])) $data[$legacyColumn] = $path;
            }
            unset($data[$field]);
        }
        return $data;
    }

    private function removeMedia(Request $r, Project $project, array &$data): void
    {
        $removeIds = collect($data['remove_image_ids'] ?? [])
            ->merge($data['remove_progress_photo_ids'] ?? [])
            ->all();
        $removed = $project->media()->whereIn('id', $removeIds)->get();
        $removedPaths = $removed->pluck('path')->filter()->unique();

        $project->media()->whereIn('id', $removeIds)->delete();

        foreach ([
            'image_path' => ['remove_legacy_image', 'image'],
            'progress_photo_path' => ['remove_legacy_progress_photo', 'progress_photo'],
        ] as $column => [$removeLegacyField, $type]) {
            $legacyPath = $project->$column;
            if ($legacyPath && ($r->boolean($removeLegacyField) || $removedPaths->contains($legacyPath))) {
                $data[$column] = $project->media()->where('type', $type)->value('path');
                $project->setAttribute($column, $data[$column]);
            }
        }

        $remainingPaths = $project->media()->pluck('path')
            ->merge([$project->image_path, $project->progress_photo_path])
            ->filter()
            ->all();

        $storage = app(SupabaseStorageService::class);
        foreach ($removedPaths as $path) {
            if (!in_array($path, $remainingPaths, true)) {
                $storage->delete($path);
            }
        }

        unset($data['remove_image_ids'], $data['remove_progress_photo_ids'], $data['remove_legacy_image'], $data['remove_legacy_progress_photo']);
    }

    private function hasImageAfterUpdate(Project $project, Request $request, array $data): bool
    {
        if (!empty($data['images'])) return true;

        $removedIds = $data['remove_image_ids'] ?? [];
        $hasMedia = $project->media()->where('type', 'image')->whereNotIn('id', $removedIds)->exists();
        $legacyRemains = $project->image_path
            && !$request->boolean('remove_legacy_image')
            && !$project->media()->where('type', 'image')->whereIn('id', $removedIds)->where('path', $project->image_path)->exists();

        return $hasMedia || (bool) $legacyRemains;
    }
 
    public function index(Request $r)
    {
        $q = Project::query()->with(['budget:id,fiscal_year', 'media'])->withSpent();
        if ($r->search) $q->where('title', 'like', "%{$r->search}%");
        if ($r->status) $q->where('status', $r->status);
        if ($r->year) $q->whereHas('budget', fn ($b) => $b->where('fiscal_year', $r->year));
        return $q->latest()->paginate(10);
    }
 
    public function store(Request $r)
    {
        $data = $r->validate($this->rules());
        if ($msg = $this->overBudget($data)) return response()->json(['message' => $msg, 'errors' => ['amount_allocated' => [$msg]]], 422);
        $data['category'] = Budget::find($data['budget_id'])->category;
        unset($data['images'], $data['progress_photos']);
        $project = Project::create($data);
        $project->update($this->files($r, [], $project));
        return response()->json($project->load('media'), 201);
    }

    public function show(Project $project)
    {
        return $project->load([
            'budget',
            'media',
            'expenses' => fn ($q) => $q->orderBy('date_purchased'),
        ])->loadSum('expenses as spent', 'total_cost');
    }
 
    public function update(Request $r, Project $project)
    {
        $data = $r->validate($this->rules($project));
        if (!$this->hasImageAfterUpdate($project, $r, $data)) {
            return response()->json([
                'message' => 'Add a project image before removing the last saved image.',
                'errors' => ['images' => ['Add a project image before removing the last saved image.']],
            ], 422);
        }
        if ($msg = $this->overBudget($data, $project)) return response()->json(['message' => $msg, 'errors' => ['amount_allocated' => [$msg]]], 422);
        $data['category'] = Budget::find($data['budget_id'])->category;
        $this->removeMedia($r, $project, $data);
        $project->update($this->files($r, $data, $project));
        return $project->load('media');
    }
 
    public function status(Request $r, Project $project)
    {
        $r->validate(['status' => 'required|in:Planned,Ongoing,Completed,Delayed']);
        if ($r->status === 'Delayed' && !$project->target_end_date) {
            return response()->json(['message' => 'Set a target end date before marking this project Delayed.'], 422);
        }
        $project->update(['status' => $r->status, 'actual_end_date' => $r->status === 'Completed' ? ($project->actual_end_date ?? now()->toDateString()) : $project->actual_end_date]);
        return $project;
    }
 
    public function destroy(Project $project)
    {
        $paths = $project->media->pluck('path')
            ->merge([$project->image_path, $project->progress_photo_path])
            ->filter()
            ->unique();
        $storage = app(SupabaseStorageService::class);
        foreach ($paths as $path) $storage->delete($path);
        $project->delete();
        return response()->noContent();
    }
}
