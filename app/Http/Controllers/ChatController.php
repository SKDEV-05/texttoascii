<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ChatController extends Controller
{
    public function index(): Response
    {
        $conversations = auth()->user()->conversations()
            ->with(['initiator', 'recipient', 'latestMessage'])
            ->get();

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Conversation $conversation): Response
    {
        // Simple authorization for now
        if ($conversation->initiator_id !== auth()->id() && $conversation->recipient_id !== auth()->id()) {
            abort(403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('chat/show', [
            'conversation' => $conversation->load(['initiator', 'recipient']),
            'messages' => $messages,
            'canSendMessage' => auth()->user()->canSendMessage(),
        ]);
    }

    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        if (! auth()->user()->canSendMessage()) {
            return back()->with('error', 'You have reached your free message limit. Please subscribe to continue.');
        }

        $request->validate([
            'body' => 'required|string',
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => auth()->id(),
            'body' => $request->body,
        ]);

        broadcast(new MessageSent($message->load('sender')))->toOthers();

        return back();
    }
}
