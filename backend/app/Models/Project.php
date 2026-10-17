<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Project extends Model
{
    protected $fillable = [
        'budget_id', 'title', 'description', 'category', 'amount_allocated', 'contractor', 'location',
        'status', 'progress_notes', 'start_date', 'target_end_date', 'actual_end_date', 'image_path', 'progress_photo_path',
    ];
    protected $casts = ['amount_allocated' => 'float', 'spent' => 'float'];
    protected $appends = ['image_url', 'photo_url', 'image_urls', 'progress_photo_urls'];

    public function budget() { return $this->belongsTo(Budget::class); }
    public function expenses() { return $this->hasMany(ProjectExpense::class); }
    public function media() { return $this->hasMany(ProjectMedia::class); }

    public function scopeWithSpent($q) { return $q->withSum('expenses as spent', 'total_cost'); }

    public function getImageUrlsAttribute()
    {
        return $this->mediaUrls('image', $this->image_path);
    }

    public function getProgressPhotoUrlsAttribute()
    {
        return $this->mediaUrls('progress_photo', $this->progress_photo_path);
    }

    public function getImageUrlAttribute() { return $this->image_urls[0] ?? null; }
    public function getPhotoUrlAttribute() { return $this->progress_photo_urls[0] ?? null; }

    private function mediaUrls(string $type, ?string $legacyPath): array
    {
        $paths = $this->media
            ->where('type', $type)
            ->pluck('path')
            ->prepend($legacyPath)
            ->filter()
            ->unique()
            ->values();

        return $paths->map(function ($path) {
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            return url('storage/'.ltrim($path, '/'));
        })->all();
    }
}
