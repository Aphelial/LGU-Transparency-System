<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\{Project, ProjectExpense};
use Illuminate\Http\Request;
 
class ExpenseController extends Controller
{
    private function data(Request $r): array
    {
        $d = $r->validate([
            'item_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'date_purchased' => 'required|date',
        ]);
        $d['total_cost'] = round($d['quantity'] * $d['unit_cost'], 2); // always computed server-side
        return $d;
    }
 
    public function index(Project $project)
    {
        $rows = $project->expenses()->orderByDesc('date_purchased')->get();
        return ['data' => $rows, 'total' => (float) $rows->sum('total_cost')];
    }
 
    public function store(Request $r, Project $project)
    {
        return response()->json($project->expenses()->create($this->data($r)), 201);
    }
 
    public function show(ProjectExpense $expense) { return $expense; }
 
    public function update(Request $r, ProjectExpense $expense)
    {
        $expense->update($this->data($r));
        return $expense;
    }
 
    public function destroy(ProjectExpense $expense)
    {
        $expense->delete();
        return response()->noContent();
    }
}
