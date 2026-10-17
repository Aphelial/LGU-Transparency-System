<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMedia extends Model
{
    protected $fillable = ['type', 'path'];
    protected $appends = ['url'];

    public function project() { return $this->belongsTo(Project::class); }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }
        return url('storage/'.ltrim($this->path, '/'));
    }
}
