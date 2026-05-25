<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Render the admin panel dashboard.
     */
    public function dashboard(): Response
    {
        return Inertia::render('admin/index', [
            'users' => User::with('talentProfile')->latest()->get(),
            'reports' => Report::with(['reporter', 'reported'])->latest()->get(),
            'transactions' => WalletTransaction::with('user')->latest()->get(),
        ]);
    }

    /**
     * Delete a user account.
     */
    public function deleteUser(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own admin account.']);
        }

        $user->delete();

        return back();
    }

    /**
     * Update a user's wallet balance or apply a 10% bonus.
     */
    public function updateWallet(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:adjust,bonus10',
            'amount' => 'required_if:action,adjust|numeric',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validated['action'] === 'bonus10') {
            $bonus = $user->wallet_balance * 0.10;
            if ($bonus <= 0) {
                return back()->withErrors(['wallet' => 'Cannot apply 10% bonus to a wallet with zero or negative balance.']);
            }
            $user->increment('wallet_balance', $bonus);

            WalletTransaction::create([
                'user_id' => $user->id,
                'amount' => $bonus,
                'type' => 'bonus',
                'description' => '10% admin wallet bonus',
            ]);
        } else {
            $amount = (float) $validated['amount'];
            $user->increment('wallet_balance', $amount);

            WalletTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => $amount >= 0 ? 'deposit' : 'withdrawal',
                'description' => $validated['description'] ?? 'Admin wallet adjustment',
            ]);
        }

        return back();
    }

    /**
     * Resolve a report by marking it as resolved.
     */
    public function resolveReport(Report $report): RedirectResponse
    {
        $report->update(['status' => 'resolved']);

        return back();
    }

    /**
     * Delete a report.
     */
    public function deleteReport(Report $report): RedirectResponse
    {
        $report->delete();

        return back();
    }
}
