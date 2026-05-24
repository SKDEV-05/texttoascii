<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function showRoleSelection(): Response
    {
        return Inertia::render('onboarding/role-selection');
    }

    public function selectRole(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:talent,parent,scout_club',
        ]);

        $user = $request->user();
        $user->update([
            'role' => $request->role,
        ]);

        if ($request->role === 'talent' || $request->role === 'parent') {
            return redirect()->route('onboarding.talent-details');
        }

        return redirect()->route('onboarding.institution-details');
    }

    public function showTalentDetails(): Response
    {
        return Inertia::render('onboarding/talent-details', [
            'positions' => ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'AMF', 'CMD', 'CF'],
            'dominant_feet' => ['left', 'right', 'both'],
        ]);
    }

    public function saveTalentDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'nationality' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'dominant_foot' => 'required|in:left,right,both',
            'height_cm' => 'required|numeric|min:50|max:250',
            'weight_kg' => 'required|numeric|min:20|max:200',
            'position' => 'required|in:GK,CB,LB,RB,CDM,CM,CAM,LW,RW,ST,AMF,CMD,CF',
            'bio' => 'nullable|string',
        ]);

        $user = $request->user();

        if ($user->role === 'parent') {
            // Parent creating their first child profile
            $child = User::create([
                'name' => $validated['display_name'],
                'email' => 'talent-'.uniqid().'@endotalent.com',
                'password' => bcrypt(Str::random(16)),
                'role' => 'talent',
                'gender' => $user->gender,
            ]);

            $child->talentProfile()->create($validated);

            $user->managedTalents()->attach($child->id);
        } else {
            // Direct talent profile
            $user->talentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $validated
            );
        }

        $user->update([
            'onboarding_progress' => array_merge($user->onboarding_progress ?? [], ['completed' => true]),
        ]);

        return redirect()->route('dashboard');
    }

    public function showInstitutionDetails(): Response
    {
        return Inertia::render('onboarding/institution-details', [
            'types' => ['school', 'club', 'scout_agency', 'scout_club'],
        ]);
    }

    public function saveInstitutionDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'institution_name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'type' => 'required|in:school,club,scout_agency,scout_club',
            'website' => 'nullable|url',
        ]);

        $user = $request->user();
        $user->institutionProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        $user->update([
            'onboarding_progress' => array_merge($user->onboarding_progress ?? [], ['completed' => true]),
        ]);

        return redirect()->route('dashboard');
    }

    public function createChildTalent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'nationality' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'dominant_foot' => 'required|in:left,right,both',
            'height_cm' => 'required|numeric|min:50|max:250',
            'weight_kg' => 'required|numeric|min:20|max:200',
            'position' => 'required|in:GK,CB,LB,RB,CDM,CM,CAM,LW,RW,ST,AMF,CMD,CF',
            'bio' => 'nullable|string',
        ]);

        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $child = User::create([
            'name' => $validated['display_name'],
            'email' => 'talent-'.uniqid().'@endotalent.com',
            'password' => bcrypt(Str::random(16)),
            'role' => 'talent',
            'gender' => $user->gender,
        ]);

        $child->talentProfile()->create($validated);

        $user->managedTalents()->attach($child->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'New child talent profile created successfully!',
        ]);

        return back();
    }
}
