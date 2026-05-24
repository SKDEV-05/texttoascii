<?php

namespace App\Http\Controllers;

use App\Events\CallSignal;
use App\Events\CallStarted;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallController extends Controller
{
    /**
     * Start a call and notify the recipient.
     */
    public function start(Request $request, Conversation $conversation): JsonResponse
    {
        if (! $conversation->hasParticipant(auth()->id())) {
            abort(403);
        }

        if (! auth()->user()->canSendMessageIn($conversation)) {
            return response()->json(['error' => 'You must unlock this chat to initiate calls.'], 403);
        }

        $request->validate([
            'call_type' => 'required|in:voice,video',
        ]);

        broadcast(new CallStarted(
            $conversation->id,
            auth()->id(),
            auth()->user()->name,
            $request->call_type
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Relay WebRTC signaling data.
     */
    public function signal(Request $request, Conversation $conversation): JsonResponse
    {
        if (! $conversation->hasParticipant(auth()->id())) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|string',
            'data' => 'required|array',
        ]);

        broadcast(new CallSignal(
            $conversation->id,
            $request->type,
            $request->data,
            auth()->id()
        ))->toOthers();

        return response()->json(['success' => true]);
    }
}
