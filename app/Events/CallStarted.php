<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $conversationId,
        public int $callerId,
        public string $callerName,
        public string $callType,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $conversation = Conversation::find($this->conversationId);
        $recipientId = $conversation->initiator_id === $this->callerId
            ? $conversation->recipient_id
            : $conversation->initiator_id;

        return [
            new PrivateChannel('chat.'.$this->conversationId),
            new PrivateChannel('App.Models.User.'.$recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.started';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'caller_id' => $this->callerId,
            'caller_name' => $this->callerName,
            'call_type' => $this->callType,
        ];
    }
}
