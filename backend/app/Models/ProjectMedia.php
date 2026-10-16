<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMedia extends Model
{
    protected $fillable = ['type', 'path'];
    protected $appends = ['url'];

    public function project() { return $this->belongsTo(Project::class); }

    public function getUrlAttribute(): string { return url('storage/'.$this->path); }
}
