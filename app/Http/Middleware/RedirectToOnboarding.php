<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectToOnboarding
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! ($user->onboarding_progress['completed'] ?? false)) {
            if (! $request->routeIs('onboarding.*') && ! $request->routeIs('logout')) {
                return redirect()->route('onboarding.role-selection');
            }
        }

        return $next($request);
    }
}
