<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource (TikTok style feed).
     */
    public function index(): Response
    {
        $videos = Video::with(['user', 'talentProfile'])
            ->withCount(['likes', 'comments'])
            ->where('is_published', true)
            ->latest()
            ->get();

        return Inertia::render('videos/index', [
            'videos' => $videos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! auth()->user()->canUploadVideo()) {
            return back()->with('error', 'You have reached your free video limit (5). Please subscribe to upload more.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime|max:102400', // 100MB
        ]);

        // Placeholder for video storage logic
        // In a real app, we would use Storage::put() and dispatch a job

        return back()->with('success', 'Video uploaded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Video $video): Response
    {
        return Inertia::render('videos/show', [
            'video' => $video->load(['user', 'talentProfile', 'comments.user']),
        ]);
    }
}
