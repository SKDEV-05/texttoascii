<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Toggle follow/unfollow for the given user.
     */
    public function toggle(Request $request, User $user): RedirectResponse
    {
        $authUser = $request->user();

        // Cannot follow yourself
        if ($authUser->id === $user->id) {
            return back();
        }

        if ($authUser->isFollowing($user->id)) {
            $authUser->following()->detach($user->id);
        } else {
            $authUser->following()->attach($user->id);
        }

        return back();
    }
}
