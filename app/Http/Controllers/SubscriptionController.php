<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function buyPro(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $proPrice = 30.00; // Price of Pack Pro

        if ($user->wallet_balance < $proPrice) {
            return back()->withErrors(['error' => 'Insufficient wallet balance. You need at least $'.number_format($proPrice, 2).' to buy Pack Pro.']);
        }

        DB::transaction(function () use ($user, $proPrice) {
            // Deduct from wallet
            $user->update([
                'wallet_balance' => $user->wallet_balance - $proPrice,
            ]);

            // Record transaction
            $user->walletTransactions()->create([
                'amount' => -$proPrice,
                'type' => 'buy_pro',
                'description' => 'Purchased Pack Pro (Unlimited Video Uploads)',
            ]);

            // Create/update subscription
            $user->subscriptions()->create([
                'plan' => 'talent_plus', // Maps to talent_plus plan
                'status' => 'active',
                'starts_at' => now(),
                'expires_at' => now()->addMonth(),
                'payment_reference' => 'wallet_'.uniqid(),
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Successfully upgraded to Pack Pro!',
        ]);

        return back();
    }
}
