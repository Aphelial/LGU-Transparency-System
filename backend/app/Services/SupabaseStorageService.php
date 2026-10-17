<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    protected ?string $url;
    protected ?string $key;
    protected string $bucket;

    public function __construct()
    {
        $this->url = rtrim((string) env('SUPABASE_URL', ''), '/');
        $this->key = env('SUPABASE_KEY');
        $this->bucket = (string) env('SUPABASE_STORAGE_BUCKET', 'projects');
    }

    public function isConfigured(): bool
    {
        return !empty($this->url) && !empty($this->key);
    }

    /**
     * Upload an uploaded file to Supabase Storage, with fallback to local disk.
     */
    public function upload(UploadedFile $file, string $folder = 'projects'): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::random(40) . '.' . $extension;
        $path = trim($folder, '/') . '/' . $filename;

        if ($this->isConfigured()) {
            try {
                $endpoint = "{$this->url}/storage/v1/object/{$this->bucket}/{$path}";
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$this->key}",
                    'apikey' => $this->key,
                    'Content-Type' => $file->getMimeType() ?: 'application/octet-stream',
                    'x-upsert' => 'true',
                ])->withBody(file_get_contents($file->getRealPath()), $file->getMimeType() ?: 'application/octet-stream')
                  ->post($endpoint);

                if ($response->successful()) {
                    // Return the public Supabase CDN URL
                    return "{$this->url}/storage/v1/object/public/{$this->bucket}/{$path}";
                }

                Log::warning('Supabase storage upload failed, falling back to local disk: ' . $response->body());
            } catch (\Throwable $e) {
                Log::error('Supabase upload exception, falling back to local disk: ' . $e->getMessage());
            }
        }

        // Fallback to standard Laravel public disk storage
        return $file->store($folder, 'public');
    }

    /**
     * Delete a file either from Supabase Storage or local disk.
     */
    public function delete(?string $pathOrUrl): void
    {
        if (empty($pathOrUrl)) {
            return;
        }

        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            if ($this->isConfigured() && str_contains($pathOrUrl, $this->url)) {
                try {
                    $search = "{$this->url}/storage/v1/object/public/{$this->bucket}/";
                    if (str_contains($pathOrUrl, $search)) {
                        $relativePath = str_replace($search, '', $pathOrUrl);
                        $endpoint = "{$this->url}/storage/v1/object/{$this->bucket}/{$relativePath}";

                        Http::withHeaders([
                            'Authorization' => "Bearer {$this->key}",
                            'apikey' => $this->key,
                        ])->delete($endpoint);
                    }
                } catch (\Throwable $e) {
                    Log::error('Supabase delete exception: ' . $e->getMessage());
                }
            }
            return;
        }

        // Local disk delete
        Storage::disk('public')->delete($pathOrUrl);
    }
}
