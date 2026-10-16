<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\{Announcement, Budget, Project, ProjectExpense};
 
class DashboardController extends Controller
{
    public function __invoke()
    {
        $activity = collect()
            ->merge(Project::latest('updated_at')->take(5)->get()->map(fn ($p) => ['type' => 'Project', 'id' => $p->id, 'text' => "{$p->title} ({$p->status})", 'at' => $p->updated_at]))
            ->merge(ProjectExpense::with('project:id,title')->latest()->take(5)->get()->map(fn ($e) => ['type' => 'Expense', 'text' => "{$e->item_name} added to {$e->project?->title}", 'at' => $e->created_at]))
            ->merge(Announcement::latest()->take(5)->get()->map(fn ($a) => ['type' => 'Announcement', 'text' => $a->title, 'at' => $a->created_at]))
            ->sortByDesc('at')->take(8)->values();
 
        return [
            'total_budget' => (float) Budget::sum('amount_allocated'),
            'projects' => Project::count(),
            'announcements' => Announcement::count(),
            'delayed' => Project::where('status', 'Delayed')->count(),
            'activity' => $activity,
        ];
    }
}
