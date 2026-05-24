<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(): Response
    {
        $transactions = auth()->user()->walletTransactions()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('wallet/index', [
            'transactions' => $transactions,
        ]);
    }

    public function topup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:5|max:10000',
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($user, $validated) {
            $user->update([
                'wallet_balance' => $user->wallet_balance + $validated['amount'],
            ]);

            $user->walletTransactions()->create([
                'amount' => $validated['amount'],
                'type' => 'topup',
                'description' => 'Simulated wallet top-up',
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Wallet topped up by $'.number_format($validated['amount'], 2).' successfully!',
        ]);

        return back();
    }

    public function transfer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:1',
        ]);

        $sender = auth()->user();

        if ($sender->email === $validated['email']) {
            return back()->withErrors(['email' => 'You cannot transfer money to yourself.']);
        }

        if ($sender->wallet_balance < $validated['amount']) {
            return back()->withErrors(['amount' => 'Insufficient wallet balance.']);
        }

        $recipient = User::where('email', $validated['email'])->firstOrFail();

        DB::transaction(function () use ($sender, $recipient, $validated) {
            $sender->update([
                'wallet_balance' => $sender->wallet_balance - $validated['amount'],
            ]);

            $recipient->update([
                'wallet_balance' => $recipient->wallet_balance + $validated['amount'],
            ]);

            $sender->walletTransactions()->create([
                'amount' => -$validated['amount'],
                'type' => 'transfer_sent',
                'description' => 'Transfer sent to '.$recipient->name.' ('.$recipient->email.')',
            ]);

            $recipient->walletTransactions()->create([
                'amount' => $validated['amount'],
                'type' => 'transfer_received',
                'description' => 'Transfer received from '.$sender->name.' ('.$sender->email.')',
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Transferred $'.number_format($validated['amount'], 2).' to '.$recipient->name.' successfully!',
        ]);

        return back();
    }
}
