<?php

use App\Models\Report;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can access the admin dashboard', function () {
    $admin = User::factory()->create(['role' => 'admin', 'phone' => '+1234567890']);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});

test('non-admin cannot access the admin dashboard', function () {
    $talent = User::factory()->create(['role' => 'talent', 'phone' => '+1234567890']);

    $response = $this->actingAs($talent)->get(route('admin.dashboard'));

    $response->assertForbidden();
});

test('admin can delete a user but not themselves', function () {
    $admin = User::factory()->create(['role' => 'admin', 'phone' => '+1234567890']);
    $user = User::factory()->create(['role' => 'talent', 'phone' => '+1234567891']);

    // Delete normal user
    $response = $this->actingAs($admin)->delete(route('admin.users.delete', $user));
    $response->assertRedirect();
    expect(User::find($user->id))->toBeNull();

    // Try deleting self
    $responseSelf = $this->actingAs($admin)->delete(route('admin.users.delete', $admin));
    $responseSelf->assertSessionHasErrors(['error']);
    expect(User::find($admin->id))->not->toBeNull();
});

test('admin can adjust a user wallet balance', function () {
    $admin = User::factory()->create(['role' => 'admin', 'phone' => '+1234567890']);
    $user = User::factory()->create(['role' => 'talent', 'phone' => '+1234567891', 'wallet_balance' => 50.00]);

    $response = $this->actingAs($admin)->post(route('admin.users.wallet', $user), [
        'action' => 'adjust',
        'amount' => 25.50,
        'description' => 'Bonus credit',
    ]);

    $response->assertRedirect();
    $user->refresh();
    expect((float) $user->wallet_balance)->toBe(75.50);

    // Verify transaction created
    $tx = WalletTransaction::where('user_id', $user->id)->first();
    expect($tx)->not->toBeNull();
    expect($tx->amount)->toBe(25.50);
    expect($tx->type)->toBe('deposit');
});

test('admin can apply a 10 percent bonus to a user wallet', function () {
    $admin = User::factory()->create(['role' => 'admin', 'phone' => '+1234567890']);
    $user = User::factory()->create(['role' => 'talent', 'phone' => '+1234567891', 'wallet_balance' => 100.00]);

    $response = $this->actingAs($admin)->post(route('admin.users.wallet', $user), [
        'action' => 'bonus10',
    ]);

    $response->assertRedirect();
    $user->refresh();
    expect((float) $user->wallet_balance)->toBe(110.00);

    // Verify transaction created
    $tx = WalletTransaction::where('user_id', $user->id)->first();
    expect($tx)->not->toBeNull();
    expect((float) $tx->amount)->toBe(10.00);
    expect($tx->type)->toBe('bonus');
});

test('admin can resolve and delete reports', function () {
    $admin = User::factory()->create(['role' => 'admin', 'phone' => '+1234567890']);
    $reporter = User::factory()->create();
    $reported = User::factory()->create();

    $report = Report::create([
        'reporter_id' => $reporter->id,
        'reported_id' => $reported->id,
        'reason' => 'spam',
        'description' => 'Test spam report',
        'status' => 'pending',
    ]);

    // Resolve report
    $response = $this->actingAs($admin)->post(route('admin.reports.resolve', $report));
    $response->assertRedirect();
    $report->refresh();
    expect($report->status)->toBe('resolved');

    // Delete report
    $responseDelete = $this->actingAs($admin)->delete(route('admin.reports.delete', $report));
    $responseDelete->assertRedirect();
    expect(Report::find($report->id))->toBeNull();
});
