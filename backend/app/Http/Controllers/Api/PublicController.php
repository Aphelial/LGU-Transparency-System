<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\{Announcement, Budget, Project};
use Illuminate\Http\Request;
 
class PublicController extends Controller
{
    private function year(Request $r): ?int
    {
        return $r->integer('fiscal_year') ?: Budget::max('fiscal_year');
    }
 
    private function breakdown($budgets)
    {
        return $budgets->map(fn ($b) => [
            'id' => $b->id,
            'fiscal_year' => $b->fiscal_year,
            'category' => $b->category,
            'allocated' => (float) $b->amount_allocated,
            'disbursed' => (float) ($b->disbursed ?? 0),
            'utilization' => $b->amount_allocated > 0 ? round(($b->disbursed ?? 0) / $b->amount_allocated * 100, 1) : 0,
        ])->values();
    }
 
    public function filters()
    {
        $projectYears = Project::whereNotNull('start_date')
            ->pluck('start_date')
            ->map(fn ($date) => (int) substr((string) $date, 0, 4))
            ->unique()
            ->sortDesc()
            ->values();

        return [
            'years' => Budget::select('fiscal_year')->distinct()->orderByDesc('fiscal_year')->pluck('fiscal_year'),
            'project_years' => $projectYears,
            'categories' => Budget::select('category')->distinct()->orderBy('category')->pluck('category'),
            'statuses' => ['Planned', 'Ongoing', 'Completed', 'Delayed'],
        ];
    }
 
    public function dashboard(Request $r)
    {
        $year = $this->year($r);
        $rows = $this->breakdown(Budget::where('fiscal_year', $year)->withDisbursed()->orderBy('category')->get());
        $total = $rows->sum('allocated');
        $disbursed = $rows->sum('disbursed');
        $projects = Project::whereHas('budget', fn ($q) => $q->where('fiscal_year', $year));
 
        return [
            'fiscal_year' => $year,
            'total_budget' => $total,
            'disbursed' => $disbursed,
            'remaining' => $total - $disbursed,
            'total_projects' => (clone $projects)->count(),
            'status_counts' => collect(['Planned', 'Ongoing', 'Completed', 'Delayed'])->map(fn ($s) => [
                'status' => $s, 'count' => (clone $projects)->where('status', $s)->count(),
            ]),
            'by_category' => $rows,
            'recent_projects' => (clone $projects)->with(['budget:id,fiscal_year', 'media'])->withSpent()->latest()->take(5)->get(),
            'latest_announcements' => Announcement::orderByDesc('date')->orderByDesc('id')->take(5)->get(),
        ];
    }
 
    public function projects(Request $r)
    {
        $q = Project::query()->with(['budget:id,fiscal_year,category', 'media'])->withSpent();
        if ($s = $r->search) {
            $q->where(fn ($w) => $w->where('title', 'like', "%$s%")->orWhere('description', 'like', "%$s%")
                ->orWhere('contractor', 'like', "%$s%")->orWhere('location', 'like', "%$s%"));
        }
        if ($r->year) $q->whereYear('start_date', $r->year);
        if ($r->category) $q->where('category', $r->category);
        if ($r->status) $q->where('status', $r->status);
        return $q->latest()->paginate(9);
    }
 
    public function project($id)
    {
        return Project::with(['budget', 'media', 'expenses' => fn ($q) => $q->orderBy('date_purchased')])->withSpent()->findOrFail($id);
    }
 
    public function budgets(Request $r)
    {
        $year = $this->year($r);
        $rows = $this->breakdown(Budget::where('fiscal_year', $year)->withDisbursed()->orderBy('category')->get());
        $total = $rows->sum('allocated');
        $disbursed = $rows->sum('disbursed');
        return ['fiscal_year' => $year, 'total_allocated' => $total, 'disbursed' => $disbursed,
            'remaining' => $total - $disbursed, 'breakdown' => $rows];
    }
 
    public function announcements(Request $r)
    {
        $q = Announcement::query();
        if ($s = $r->search) $q->where(fn ($w) => $w->where('title', 'like', "%$s%")->orWhere('description', 'like', "%$s%"));
        if ($r->category) $q->where('category', $r->category);
        if ($r->date) $q->whereDate('date', $r->date);
        return $q->orderByDesc('date')->orderByDesc('id')->paginate(8);
    }
 
    public function announcement($id)
    {
        return Announcement::findOrFail($id);
    }
}
