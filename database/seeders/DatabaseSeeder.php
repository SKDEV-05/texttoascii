<?php

namespace Database\Seeders;

use App\Models\Report;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Admin Account
        $admin = User::create([
            'name' => 'Bayan Admin',
            'email' => 'admin@bayan.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'gender' => 'male',
            'phone' => '+1234567890',
            'wallet_balance' => 0.00,
            'onboarding_progress' => ['completed' => true],
        ]);

        // Seed Scout Club Account
        $scout = User::create([
            'name' => 'AC Milan Scout',
            'email' => 'scout@bayan.com',
            'password' => Hash::make('password'),
            'role' => 'scout_club',
            'gender' => 'male',
            'phone' => '+1234567891',
            'wallet_balance' => 500.00,
            'onboarding_progress' => ['completed' => true],
        ]);

        // Seed Talent Account
        $talent = User::create([
            'name' => 'Leo Messi Jr',
            'email' => 'talent@bayan.com',
            'password' => Hash::make('password'),
            'role' => 'talent',
            'gender' => 'male',
            'phone' => '+1234567892',
            'wallet_balance' => 100.00,
            'onboarding_progress' => ['completed' => true],
        ]);

        // Seed Parent Account
        $parent = User::create([
            'name' => 'Jorge Messi Sr',
            'email' => 'parent@bayan.com',
            'password' => Hash::make('password'),
            'role' => 'parent',
            'gender' => 'male',
            'phone' => '+1234567893',
            'wallet_balance' => 200.00,
            'onboarding_progress' => ['completed' => true],
        ]);

        // Seed wallet transactions
        WalletTransaction::create([
            'user_id' => $scout->id,
            'amount' => 500.00,
            'type' => 'deposit',
            'description' => 'Initial scout club wallet load',
        ]);

        WalletTransaction::create([
            'user_id' => $talent->id,
            'amount' => 100.00,
            'type' => 'deposit',
            'description' => 'Talent sign-up bonus',
        ]);

        WalletTransaction::create([
            'user_id' => $parent->id,
            'amount' => 200.00,
            'type' => 'deposit',
            'description' => 'Parent wallet deposit',
        ]);

        // Seed reports
        Report::create([
            'reporter_id' => $scout->id,
            'reported_id' => $talent->id,
            'reason' => 'inappropriate',
            'description' => 'The talent has uploaded content that is not relevant to football skills.',
            'status' => 'pending',
        ]);

        Report::create([
            'reporter_id' => $parent->id,
            'reported_id' => $scout->id,
            'reason' => 'harassment',
            'description' => 'This scout keeps messaging our child account without unlocking contact.',
            'status' => 'pending',
        ]);
    }
}
