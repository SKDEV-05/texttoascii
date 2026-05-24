<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoLike extends Model
{
    protected $fillable = [
        'video_id',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
