<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

it('allows a user to follow another user', function () {
    $follower = User::factory()->create();
    $target = User::factory()->create();

    actingAs($follower)
        ->post("/users/{$target->id}/follow")
        ->assertRedirect();

    expect($follower->isFollowing($target->id))->toBeTrue();
});

it('allows a user to unfollow a user they already follow', function () {
    $follower = User::factory()->create();
    $target = User::factory()->create();

    $follower->following()->attach($target->id);

    actingAs($follower)
        ->post("/users/{$target->id}/follow")
        ->assertRedirect();

    expect($follower->fresh()->isFollowing($target->id))->toBeFalse();
});

it('prevents a user from following themselves', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->post("/users/{$user->id}/follow")
        ->assertRedirect();

    expect($user->followers()->count())->toBe(0);
});

it('redirects guests to login when attempting to follow', function () {
    $target = User::factory()->create();

    post("/users/{$target->id}/follow")
        ->assertRedirect('/login');
});
