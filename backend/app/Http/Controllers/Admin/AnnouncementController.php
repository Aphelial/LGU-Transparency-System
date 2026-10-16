<?php
 
namespace App\Http\Controllers\Admin;
 
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
 
class AnnouncementController extends Controller
{
    private function data(Request $r, ?Announcement $a = null): array
    {
        $d = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:Program,Event,Relief',
            'date' => 'required|date',
            'beneficiaries_count' => 'nullable|integer|min:0',
            'venue' => 'nullable|string|max:255',
            'banner' => 'nullable|image|max:4096',
        ]);
        $d['beneficiaries_count'] = $d['beneficiaries_count'] ?? 0;
        if ($r->hasFile('banner')) {
            if ($a?->banner_image) Storage::disk('public')->delete($a->banner_image);
            $d['banner_image'] = $r->file('banner')->store('announcements', 'public');
        }
        unset($d['banner']);
        return $d;
    }
 
    public function index(Request $r)
    {
        $q = Announcement::query();
        if ($r->search) $q->where('title', 'like', "%{$r->search}%");
        if ($r->category) $q->where('category', $r->category);
        return $q->orderByDesc('date')->orderByDesc('id')->paginate(10);
    }
 
    public function store(Request $r) { return response()->json(Announcement::create($this->data($r)), 201); }
 
    public function show(Announcement $announcement) { return $announcement; }
 
    public function update(Request $r, Announcement $announcement)
    {
        $announcement->update($this->data($r, $announcement));
        return $announcement;
    }
 
    public function destroy(Announcement $announcement)
    {
        if ($announcement->banner_image) Storage::disk('public')->delete($announcement->banner_image);
        $announcement->delete();
        return response()->noContent();
    }
}
