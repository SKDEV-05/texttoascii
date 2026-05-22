<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PitchAvatar extends Model
{
    use HasFactory;

    protected $fillable = [
        'talent_profile_id',
        'position_x',
        'position_y',
        'avatar_style',
        'custom_color',
    ];

    protected $casts = [
        'position_x' => 'float',
        'position_y' => 'float',
    ];

    public function talentProfile(): BelongsTo
    {
        return $this->belongsTo(TalentProfile::class);
    }
}
