<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TalentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'date_of_birth',
        'nationality',
        'city',
        'country',
        'latitude',
        'longitude',
        'dominant_foot',
        'height_cm',
        'weight_kg',
        'position',
        'secondary_position',
        'bio',
        'is_public',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_public' => 'boolean',
        'height_cm' => 'float',
        'weight_kg' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'position' => 'string',
        'secondary_position' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(Video::class);
    }

    public function pitchAvatar(): HasOne
    {
        return $this->hasOne(PitchAvatar::class);
    }
}
