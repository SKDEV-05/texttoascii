<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'talent_profile_id',
        'title',
        'description',
        'file_path',
        'thumbnail_path',
        'orientation',
        'duration_seconds',
        'views_count',
        'status',
        'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'duration_seconds' => 'integer',
        'views_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function talentProfile(): BelongsTo
    {
        return $this->belongsTo(TalentProfile::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(VideoLike::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(VideoComment::class);
    }
}
