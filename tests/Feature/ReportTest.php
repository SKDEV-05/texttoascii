<?php

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can report another user', function () {
    $reporter = User::factory()->create();
    $reported = User::factory()->create();

    $this->actingAs($reporter)
        ->post(route('reports.store'), [
            'reported_id' => $reported->id,
            'reason' => 'harassment',
            'description' => 'They were harassing me in messages.',
        ])
        ->assertRedirect();

    $report = Report::first();
    expect($report)->not->toBeNull();
    expect($report->reporter_id)->toBe($reporter->id);
    expect($report->reported_id)->toBe($reported->id);
    expect($report->reason)->toBe('harassment');
    expect($report->description)->toBe('They were harassing me in messages.');
    expect($report->status)->toBe('pending');
});

test('user cannot report themselves', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('reports.store'), [
            'reported_id' => $user->id,
            'reason' => 'spam',
        ])
        ->assertSessionHasErrors(['reported_id']);

    expect(Report::count())->toBe(0);
});

test('report requires a valid reason', function () {
    $reporter = User::factory()->create();
    $reported = User::factory()->create();

    $this->actingAs($reporter)
        ->post(route('reports.store'), [
            'reported_id' => $reported->id,
            'reason' => 'invalid_reason_here',
        ])
        ->assertSessionHasErrors(['reason']);

    expect(Report::count())->toBe(0);
});
