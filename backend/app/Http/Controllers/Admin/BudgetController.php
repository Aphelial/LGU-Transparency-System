<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
 
class BudgetController extends Controller
{
    private function rules(?Budget $b = null, ?Request $r = null): array
    {
        return [
            'fiscal_year' => 'required|integer|between:2000,2100',
            'category' => ['required', 'string', 'max:100', Rule::unique('budgets')->where('fiscal_year', $r?->fiscal_year)->ignore($b?->id)],
            'amount_allocated' => 'required|numeric|min:0|max:9999999999999',
        ];
    }
 
    public function index(Request $r)
    {
        $q = Budget::query()->withDisbursed();
        if ($r->search) $q->where('category', 'like', "%{$r->search}%");
        if ($r->fiscal_year) $q->where('fiscal_year', $r->fiscal_year);
        return $q->orderByDesc('fiscal_year')->orderBy('category')->paginate(min($r->integer('per_page', 10), 100));
    }
 
    public function store(Request $r)
    {
        return response()->json(Budget::create($r->validate($this->rules(null, $r))), 201);
    }
 
    public function show(Budget $budget) { return $budget; }
 
    public function update(Request $r, Budget $budget)
    {
        $data = $r->validate($this->rules($budget, $r));
        $allocated = $budget->projects()->sum('amount_allocated');
        if ($data['amount_allocated'] < $allocated) {
            return response()->json(['message' => 'Amount cannot be lower than the ₱'.number_format($allocated, 2).' already assigned to projects.'], 422);
        }
        $budget->update($data);
        return $budget;
    }
 
    public function destroy(Budget $budget)
    {
        if ($budget->projects()->exists()) {
            return response()->json(['message' => 'This budget has linked projects. Remove or reassign them first.'], 422);
        }
        $budget->delete();
        return response()->noContent();
    }
}
