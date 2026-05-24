<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'type',
        'media_path',
        'duration',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'duration' => 'integer',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the full URL for media files (voice messages, images).
     */
    public function getMediaUrlAttribute(): ?string
    {
        return $this->media_path ? asset($this->media_path) : null;
    }
}
