<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Budget extends Model
{
    protected $fillable = ['fiscal_year', 'category', 'amount_allocated'];
    protected $casts = ['amount_allocated' => 'float', 'fiscal_year' => 'integer'];
 
    public function projects() { return $this->hasMany(Project::class); }
    public function expenses() { return $this->hasManyThrough(ProjectExpense::class, Project::class); }
 
    /** Adds `disbursed` = SUM(project_expenses.total_cost) */
    public function scopeWithDisbursed($q)
    {
        return $q->withSum('expenses as disbursed', 'total_cost');
    }
}
