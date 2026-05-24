<?php

use App\Events\CallSignal;
use App\Events\CallStarted;
use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('scout can start a conversation with a talent', function () {
    $scout = User::factory()->create(['role' => 'scout_club']);
    $talent = User::factory()->create(['role' => 'talent']);

    $this->actingAs($scout)
        ->post(route('chat.start', $talent->id))
        ->assertRedirect();

    $conversation = Conversation::first();
    expect($conversation)->not->toBeNull();
    expect($conversation->initiator_id)->toBe($scout->id);
    expect($conversation->recipient_id)->toBe($talent->id);
    expect($conversation->is_paid)->toBeFalse(); // Starts unpaid for scouts
});

test('talent can start a conversation with a scout and it is free', function () {
    $talent = User::factory()->create(['role' => 'talent']);
    $scout = User::factory()->create(['role' => 'scout_club']);

    $this->actingAs($talent)
        ->post(route('chat.start', $scout->id))
        ->assertRedirect();

    $conversation = Conversation::first();
    expect($conversation)->not->toBeNull();
    expect($conversation->initiator_id)->toBe($talent->id);
    expect($conversation->recipient_id)->toBe($scout->id);
    expect($conversation->is_paid)->toBeTrue(); // Free if talent starts
});

test('scout cannot send message in unpaid conversation without subscription or unlock', function () {
    $scout = User::factory()->create(['role' => 'scout_club']);
    $talent = User::factory()->create(['role' => 'talent']);

    $conversation = Conversation::create([
        'initiator_id' => $scout->id,
        'recipient_id' => $talent->id,
        'is_paid' => false,
    ]);

    $this->actingAs($scout)
        ->post(route('chat.store', $conversation->id), [
            'body' => 'Hello!',
        ])
        ->assertSessionHas('error');

    expect(Message::count())->toBe(0);
});

test('scout can pay to unlock conversation', function () {
    $scout = User::factory()->create([
        'role' => 'scout_club',
        'wallet_balance' => 20.00,
    ]);
    $talent = User::factory()->create([
        'role' => 'talent',
        'wallet_balance' => 0.00,
    ]);

    $conversation = Conversation::create([
        'initiator_id' => $scout->id,
        'recipient_id' => $talent->id,
        'is_paid' => false,
    ]);

    $this->actingAs($scout)
        ->post(route('chat.pay', $conversation->id))
        ->assertRedirect();

    expect($conversation->fresh()->is_paid)->toBeTrue();
    expect($scout->fresh()->wallet_balance)->toEqual(10.00); // 20 - 10 fee
    expect($talent->fresh()->wallet_balance)->toEqual(9.00); // 90% payout
    expect($scout->walletTransactions()->count())->toBe(1);
    expect($talent->walletTransactions()->count())->toBe(1);
});

test('scout can send text and voice messages once conversation is paid', function () {
    Storage::fake('public');
    Event::fake([MessageSent::class]);

    $scout = User::factory()->create([
        'role' => 'scout_club',
    ]);
    $talent = User::factory()->create([
        'role' => 'talent',
    ]);

    $conversation = Conversation::create([
        'initiator_id' => $scout->id,
        'recipient_id' => $talent->id,
        'is_paid' => true, // Paid conversation
    ]);

    // Send text message
    $this->actingAs($scout)
        ->post(route('chat.store', $conversation->id), [
            'body' => 'Hello, I paid!',
        ])
        ->assertRedirect();

    expect(Message::count())->toBe(1);
    expect(Message::first()->body)->toBe('Hello, I paid!');
    Event::assertDispatched(MessageSent::class);

    // Send voice message
    $file = UploadedFile::fake()->create('voice.wav', 100); // 100KB file

    $this->actingAs($scout)
        ->post(route('chat.voice', $conversation->id), [
            'audio' => $file,
            'duration' => 5,
        ])
        ->assertRedirect();

    expect(Message::count())->toBe(2);
    $voiceMsg = Message::orderBy('id', 'desc')->first();
    expect($voiceMsg->type)->toBe('voice');
    expect($voiceMsg->duration)->toEqual(5);
    expect($voiceMsg->media_path)->not->toBeNull();
});

test('scout can initiate call events if conversation is paid', function () {
    Event::fake([CallStarted::class, CallSignal::class]);

    $scout = User::factory()->create([
        'role' => 'scout_club',
    ]);
    $talent = User::factory()->create([
        'role' => 'talent',
    ]);

    $conversation = Conversation::create([
        'initiator_id' => $scout->id,
        'recipient_id' => $talent->id,
        'is_paid' => true,
    ]);

    // Test start call
    $this->actingAs($scout)
        ->postJson(route('call.start', $conversation->id), [
            'call_type' => 'video',
        ])
        ->assertSuccessful();

    Event::assertDispatched(CallStarted::class);

    // Test signal transmission
    $this->actingAs($scout)
        ->postJson(route('call.signal', $conversation->id), [
            'type' => 'offer',
            'data' => ['sdp' => 'xyz'],
        ])
        ->assertSuccessful();

    Event::assertDispatched(CallSignal::class);
});
