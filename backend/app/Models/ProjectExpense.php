<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class ProjectExpense extends Model
{
    protected $fillable = ['project_id', 'item_name', 'quantity', 'unit_cost', 'total_cost', 'date_purchased'];
    protected $casts = ['unit_cost' => 'float', 'total_cost' => 'float', 'quantity' => 'integer'];
 
    public function project() { return $this->belongsTo(Project::class); }
}
