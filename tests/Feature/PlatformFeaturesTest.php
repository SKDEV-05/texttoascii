<?php

use App\Models\TalentProfile;
use App\Models\UnlockedContact;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can top up their wallet', function () {
    $user = User::factory()->create([
        'wallet_balance' => 0.00,
    ]);

    $this->actingAs($user)
        ->post(route('wallet.topup'), [
            'amount' => 100.00,
        ])
        ->assertRedirect();

    expect($user->fresh()->wallet_balance)->toEqual(100.00);
    expect($user->walletTransactions()->count())->toBe(1);
    expect($user->walletTransactions()->first()->type)->toBe('topup');
});

test('user can transfer money to another user', function () {
    $sender = User::factory()->create([
        'wallet_balance' => 100.00,
    ]);
    $recipient = User::factory()->create([
        'wallet_balance' => 0.00,
    ]);

    $this->actingAs($sender)
        ->post(route('wallet.transfer'), [
            'email' => $recipient->email,
            'amount' => 40.00,
        ])
        ->assertRedirect();

    expect($sender->fresh()->wallet_balance)->toEqual(60.00);
    expect($recipient->fresh()->wallet_balance)->toEqual(40.00);

    expect($sender->walletTransactions()->count())->toBe(1);
    expect($sender->walletTransactions()->first()->type)->toBe('transfer_sent');

    expect($recipient->walletTransactions()->count())->toBe(1);
    expect($recipient->walletTransactions()->first()->type)->toBe('transfer_received');
});

test('scout can unlock talent contact details', function () {
    $scout = User::factory()->create([
        'role' => 'scout_club',
        'wallet_balance' => 100.00,
    ]);

    $talent = User::factory()->create([
        'role' => 'talent',
        'wallet_balance' => 0.00,
    ]);

    $talentProfile = TalentProfile::create([
        'user_id' => $talent->id,
        'display_name' => 'John Doe',
        'position' => 'ST',
        'dominant_foot' => 'right',
        'height_cm' => 180,
        'weight_kg' => 75,
        'nationality' => 'French',
        'date_of_birth' => '2010-01-01',
    ]);

    $this->actingAs($scout)
        ->post(route('talents.unlock', $talentProfile->id))
        ->assertRedirect();

    expect($scout->fresh()->wallet_balance)->toEqual(50.00);
    expect($talent->fresh()->wallet_balance)->toEqual(45.00); // 90% payout

    expect(UnlockedContact::where('scout_id', $scout->id)->where('talent_id', $talent->id)->exists())->toBeTrue();
    expect($scout->canSeeContactInfo($talent))->toBeTrue();
});

test('talent or parent can purchase pro pack using wallet', function () {
    $user = User::factory()->create([
        'role' => 'talent',
        'wallet_balance' => 50.00,
    ]);

    $this->actingAs($user)
        ->post(route('subscription.buy-pro'))
        ->assertRedirect();

    expect($user->fresh()->wallet_balance)->toEqual(20.00); // 50 - 30 pro price
    expect($user->activeSubscription()->exists())->toBeTrue();
    expect($user->activeSubscription->plan)->toBe('talent_plus');
    expect($user->canUploadVideo())->toBeTrue();
});

test('parent onboarding creates linked child talent user', function () {
    $parent = User::factory()->create([
        'role' => 'parent',
    ]);

    $this->actingAs($parent)
        ->post(route('onboarding.talent-details'), [
            'display_name' => 'Young Star',
            'date_of_birth' => '2015-05-15',
            'nationality' => 'French',
            'dominant_foot' => 'right',
            'height_cm' => 140,
            'weight_kg' => 35,
            'position' => 'ST',
            'bio' => 'A promising young striker.',
        ])
        ->assertRedirect();

    expect($parent->managedTalents()->count())->toBe(1);

    $child = $parent->managedTalents()->first();
    expect($child->role)->toBe('talent');
    expect($child->talentProfile->display_name)->toBe('Young Star');
    expect($child->talentProfile->position)->toBe('ST');
});

test('guest can access video feed', function () {
    $this->get('/')
        ->assertStatus(200);
});

test('guest cannot post a comment', function () {
    $user = User::factory()->create();
    $talentProfile = TalentProfile::create([
        'user_id' => $user->id,
        'display_name' => 'John Doe',
        'position' => 'ST',
        'dominant_foot' => 'right',
        'height_cm' => 180,
        'weight_kg' => 75,
        'nationality' => 'French',
        'date_of_birth' => '2010-01-01',
    ]);

    $video = Video::create([
        'user_id' => $user->id,
        'talent_profile_id' => $talentProfile->id,
        'title' => 'My skills',
        'description' => 'Freestyle skill',
        'file_path' => '/storage/videos/test.mp4',
        'orientation' => 'vertical',
        'status' => 'ready',
        'is_published' => true,
    ]);

    $this->post("/videos/{$video->id}/comments", [
        'comment' => 'Great video!',
    ])->assertRedirect('/login');
});

test('authenticated user can post a comment', function () {
    $user = User::factory()->create();
    $talentProfile = TalentProfile::create([
        'user_id' => $user->id,
        'display_name' => 'John Doe',
        'position' => 'ST',
        'dominant_foot' => 'right',
        'height_cm' => 180,
        'weight_kg' => 75,
        'nationality' => 'French',
        'date_of_birth' => '2010-01-01',
    ]);

    $video = Video::create([
        'user_id' => $user->id,
        'talent_profile_id' => $talentProfile->id,
        'title' => 'My skills',
        'description' => 'Freestyle skill',
        'file_path' => '/storage/videos/test.mp4',
        'orientation' => 'vertical',
        'status' => 'ready',
        'is_published' => true,
    ]);

    $this->actingAs($user)
        ->post("/videos/{$video->id}/comments", [
            'comment' => 'Great video!',
        ])->assertRedirect();

    expect($video->comments()->count())->toBe(1);
    expect($video->comments()->first()->comment)->toBe('Great video!');
    expect($video->comments()->first()->user_id)->toBe($user->id);
});

test('scout can access the talents index', function () {
    $scout = User::factory()->create(['role' => 'scout_club']);

    $this->actingAs($scout)
        ->get(route('talents.index'))
        ->assertStatus(200);
});

test('non-scout cannot access the talents index', function () {
    $talent = User::factory()->create(['role' => 'talent']);

    $this->actingAs($talent)
        ->get(route('talents.index'))
        ->assertStatus(403);
});

test('guest cannot access the talents index', function () {
    $this->get(route('talents.index'))
        ->assertRedirect('/login');
});
