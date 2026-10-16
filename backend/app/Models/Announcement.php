<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Announcement extends Model
{
    protected $fillable = ['title', 'description', 'category', 'date', 'beneficiaries_count', 'venue', 'banner_image'];
    protected $appends = ['banner_url'];
 
    public function getBannerUrlAttribute() { return $this->banner_image ? url('storage/'.$this->banner_image) : null; }
}
