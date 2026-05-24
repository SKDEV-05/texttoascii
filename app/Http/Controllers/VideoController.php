<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource (TikTok style feed).
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Pre-load the authenticated user's following IDs for efficient lookups
        $followingIds = $user ? $user->following()->pluck('follows.following_id')->flip() : collect();

        $videos = Video::with(['user', 'talentProfile', 'comments.user', 'likes'])
            ->withCount(['likes', 'comments'])
            ->where('is_published', true)
            ->latest()
            ->get()
            ->map(function ($video) use ($user, $followingIds) {
                $video->is_liked = $user ? $video->likes->contains('user_id', $user->id) : false;
                $video->is_followed = $user ? $followingIds->has($video->user_id) : false;
                unset($video->likes);

                return $video;
            });

        return Inertia::render('videos/index', [
            'videos' => $videos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (! $user->canUploadVideo()) {
            return back()->withErrors(['error' => 'You have reached your free video limit (5). Please subscribe to upload more.']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime,video/x-matroska,video/webm|max:102400', // 100MB
            'talent_profile_id' => 'nullable|exists:talent_profiles,id',
        ]);

        $talentProfileId = null;
        $videoUserId = $user->id;

        if ($user->role === 'parent') {
            if (empty($validated['talent_profile_id'])) {
                return back()->withErrors(['talent_profile_id' => 'Please select which child profile this video is for.']);
            }

            // Verify child is managed by this parent
            $child = $user->managedTalents()->whereHas('talentProfile', function ($q) use ($validated) {
                $q->where('id', $validated['talent_profile_id']);
            })->first();

            if (! $child) {
                return back()->withErrors(['talent_profile_id' => 'Invalid child profile.']);
            }

            $talentProfileId = $validated['talent_profile_id'];
            $videoUserId = $child->id;
        } else {
            $talentProfileId = $user->talentProfile?->id;
            if (! $talentProfileId) {
                return back()->withErrors(['error' => 'Please complete your talent profile first.']);
            }
        }

        // Store file
        $path = $request->file('video')->store('videos', 'public');

        Video::create([
            'user_id' => $videoUserId,
            'talent_profile_id' => $talentProfileId,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_path' => '/storage/'.$path,
            'orientation' => 'vertical',
            'status' => 'ready',
            'is_published' => true,
        ]);

        return back();
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

    /**
     * Store a comment for the video.
     */
    public function storeComment(Request $request, Video $video): RedirectResponse
    {
        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $video->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $request->comment,
        ]);

        return back();
    }

    /**
     * Toggle like for the video.
     */
    public function toggleLike(Video $video): RedirectResponse
    {
        $userId = auth()->id();
        $like = $video->likes()->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
        } else {
            $video->likes()->create([
                'user_id' => $userId,
            ]);
        }

        return back();
    }
}
