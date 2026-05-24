<?php

namespace App\Http\Controllers;

use App\Models\TalentProfile;
use App\Models\UnlockedContact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TalentController extends Controller
{
    /**
     * Display a listing of the talents.
     */
    public function index(Request $request): Response
    {
        $query = TalentProfile::with('user');

        // Apply filters
        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('gender')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('gender', $request->gender);
            });
        }

        if ($request->filled('dominant_foot')) {
            $query->where('dominant_foot', $request->dominant_foot);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                    ->orWhere('nationality', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%");
            });
        }

        $talents = $query->latest()->get();

        return Inertia::render('talents/index', [
            'talents' => $talents,
            'filters' => $request->only(['position', 'gender', 'dominant_foot', 'search']),
        ]);
    }

    /**
     * Display the specified talent.
     */
    public function show(TalentProfile $talent): Response
    {
        $talentUser = $talent->user;
        $canSeeContactInfo = auth()->user()->canSeeContactInfo($talentUser);

        return Inertia::render('talents/show', [
            'talent' => [
                'id' => $talent->id,
                'display_name' => $talent->display_name,
                'position' => $talent->position,
                'bio' => $talent->bio,
                'nationality' => $talent->nationality,
                'dominant_foot' => $talent->dominant_foot,
                'height_cm' => $talent->height_cm,
                'weight_kg' => $talent->weight_kg,
                'user' => [
                    'id' => $talentUser->id,
                    'name' => $talentUser->name,
                    'email' => $talentUser->email,
                    'phone' => $talentUser->phone,
                ],
            ],
            'canSeeContactInfo' => $canSeeContactInfo,
        ]);
    }

    /**
     * Unlock talent contact information using scout's wallet.
     */
    public function unlockContact(Request $request, TalentProfile $talent): RedirectResponse
    {
        $scout = auth()->user();
        $talentUser = $talent->user;

        // Check if already unlocked
        if ($scout->canSeeContactInfo($talentUser)) {
            return back()->with('error', 'Contact information is already unlocked.');
        }

        $price = 50.00; // Unlock price

        if ($scout->wallet_balance < $price) {
            return back()->withErrors(['error' => 'Insufficient wallet balance. You need at least $'.number_format($price, 2).' to unlock this contact.']);
        }

        // Determine destination wallet
        $parent = $talentUser->parents()->first();
        $recipient = $parent ? $parent : $talentUser;

        DB::transaction(function () use ($scout, $talentUser, $recipient, $price, $talent) {
            // Deduct from scout
            $scout->update([
                'wallet_balance' => $scout->wallet_balance - $price,
            ]);

            // Add 90% to recipient
            $recipientAmount = $price * 0.90;
            $recipient->update([
                'wallet_balance' => $recipient->wallet_balance + $recipientAmount,
            ]);

            // Create scout transaction
            $scout->walletTransactions()->create([
                'amount' => -$price,
                'type' => 'purchase_contact',
                'description' => 'Unlocked contact info for talent '.$talent->display_name,
            ]);

            // Create recipient transaction
            $recipient->walletTransactions()->create([
                'amount' => $recipientAmount,
                'type' => 'received_contact',
                'description' => 'Contact unlocked for talent '.$talent->display_name.' (90% payout)',
            ]);

            // Create unlock record
            UnlockedContact::create([
                'scout_id' => $scout->id,
                'talent_id' => $talentUser->id,
                'amount_paid' => $price,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Unlocked contact details for '.$talent->display_name.' successfully!',
        ]);

        return back();
    }
}
