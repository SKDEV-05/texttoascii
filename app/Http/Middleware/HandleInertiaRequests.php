<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'gender' => $request->user()->gender,
                    'wallet_balance' => (float) $request->user()->wallet_balance,
                    'layout' => $request->user()->layout,
                    'avatar_path' => $request->user()->avatar_path,
                    'onboarding_progress' => $request->user()->onboarding_progress,
                    'talent_profile' => $request->user()->talentProfile ? [
                        'id' => $request->user()->talentProfile->id,
                        'display_name' => $request->user()->talentProfile->display_name,
                        'position' => $request->user()->talentProfile->position,
                    ] : null,
                    'managed_talents' => $request->user()->role === 'parent' ? $request->user()->managedTalents()->with('talentProfile')->get()->map(function ($talent) {
                        return [
                            'id' => $talent->id,
                            'name' => $talent->name,
                            'email' => $talent->email,
                            'gender' => $talent->gender,
                            'talent_profile' => $talent->talentProfile ? [
                                'id' => $talent->talentProfile->id,
                                'display_name' => $talent->talentProfile->display_name,
                                'position' => $talent->talentProfile->position,
                                'bio' => $talent->talentProfile->bio,
                                'dominant_foot' => $talent->talentProfile->dominant_foot,
                                'height_cm' => $talent->talentProfile->height_cm,
                                'weight_kg' => $talent->talentProfile->weight_kg,
                                'nationality' => $talent->talentProfile->nationality,
                            ] : null,
                            'videos_count' => $talent->videos()->count(),
                        ];
                    }) : null,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
