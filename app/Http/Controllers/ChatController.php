<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();
        $conversations = auth()->user()->conversations()
            ->with(['initiator', 'recipient', 'latestMessage'])
            ->get()
            ->map(function ($conversation) use ($userId) {
                $conversation->unread_count = $conversation->unreadCountFor($userId);
                // Dynamically mark as paid if the user can send messages (e.g. they unlocked the contact)
                $conversation->is_paid = $conversation->is_paid || auth()->user()->canSendMessageIn($conversation);

                return $conversation;
            });

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Conversation $conversation): Response
    {
        if ($conversation->initiator_id !== auth()->id() && $conversation->recipient_id !== auth()->id()) {
            abort(403);
        }

        // Dynamically mark as paid if the user can send messages (e.g. they unlocked the contact)
        $conversation->is_paid = $conversation->is_paid || auth()->user()->canSendMessageIn($conversation);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('chat/show', [
            'conversation' => $conversation->load(['initiator', 'recipient']),
            'messages' => $messages,
            'canSendMessage' => auth()->user()->canSendMessageIn($conversation),
        ]);
    }

    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        if (! auth()->user()->canSendMessageIn($conversation)) {
            return back()->with('error', 'You cannot send messages in this conversation. Please unlock it.');
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

    public function startConversation(Request $request, User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot message yourself.');
        }

        $conversation = Conversation::where(function ($query) use ($user) {
            $query->where('initiator_id', auth()->id())
                ->where('recipient_id', $user->id);
        })->orWhere(function ($query) use ($user) {
            $query->where('initiator_id', $user->id)
                ->where('recipient_id', auth()->id());
        })->first();

        if (! $conversation) {
            $isPaid = auth()->user()->role !== 'scout_club'
                || auth()->user()->activeSubscription()->exists()
                || auth()->user()->unlockedContacts()->where('talent_id', $user->id)->exists();

            $conversation = Conversation::create([
                'initiator_id' => auth()->id(),
                'recipient_id' => $user->id,
                'is_paid' => $isPaid,
            ]);
        } elseif (! $conversation->is_paid && auth()->user()->canSendMessageIn($conversation)) {
            $conversation->update(['is_paid' => true]);
        }

        return redirect()->route('chat.show', $conversation);
    }

    public function pay(Conversation $conversation): RedirectResponse
    {
        $scout = auth()->user();
        if ($scout->role !== 'scout_club') {
            return back()->with('error', 'Only scouts need to pay for conversations.');
        }

        if ($conversation->is_paid) {
            return back()->with('error', 'This conversation is already unlocked.');
        }

        $price = 10.00; // $10.00 to unlock messaging
        if ($scout->wallet_balance < $price) {
            return back()->withErrors(['error' => 'Insufficient wallet balance. You need at least $'.number_format($price, 2).' to unlock messaging.']);
        }

        $recipientId = $conversation->initiator_id === $scout->id ? $conversation->recipient_id : $conversation->initiator_id;
        $recipient = User::findOrFail($recipientId);

        $parent = $recipient->parents()->first();
        $finalRecipient = $parent ? $parent : $recipient;
        $recipientAmount = $price * 0.90;

        DB::transaction(function () use ($scout, $finalRecipient, $recipient, $price, $recipientAmount, $conversation) {
            $scout->update([
                'wallet_balance' => $scout->wallet_balance - $price,
            ]);

            $finalRecipient->update([
                'wallet_balance' => $finalRecipient->wallet_balance + $recipientAmount,
            ]);

            $scout->walletTransactions()->create([
                'amount' => -$price,
                'type' => 'purchase_chat',
                'description' => 'Unlocked conversation with '.$recipient->name,
            ]);

            $finalRecipient->walletTransactions()->create([
                'amount' => $recipientAmount,
                'type' => 'received_chat',
                'description' => 'Chat unlocked by scout '.$scout->name.' (90% payout)',
            ]);

            $conversation->update(['is_paid' => true]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Unlocked chat with '.$recipient->name.' successfully!',
        ]);

        return back();
    }

    public function voice(Request $request, Conversation $conversation): RedirectResponse
    {
        if (! auth()->user()->canSendMessageIn($conversation)) {
            return back()->with('error', 'You cannot send messages in this conversation.');
        }

        $request->validate([
            'audio' => 'required|file|max:10240',
            'duration' => 'required|numeric',
        ]);

        $path = $request->file('audio')->store('voice_messages', 'public');

        $message = $conversation->messages()->create([
            'sender_id' => auth()->id(),
            'body' => '[Voice Message]',
            'type' => 'voice',
            'media_path' => $path,
            'duration' => $request->duration,
        ]);

        broadcast(new MessageSent($message->load('sender')))->toOthers();

        return back();
    }

    public function markRead(Conversation $conversation): JsonResponse
    {
        if ($conversation->initiator_id !== auth()->id() && $conversation->recipient_id !== auth()->id()) {
            abort(403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
