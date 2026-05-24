<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation && ($conversation->initiator_id === $user->id || $conversation->recipient_id === $user->id);
});

// Presence channel for WebRTC call signaling
Broadcast::channel('call.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (! $conversation || ! $conversation->hasParticipant($user->id)) {
        return null;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar_path' => $user->avatar_path,
    ];
});
