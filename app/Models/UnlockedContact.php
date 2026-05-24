<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnlockedContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'scout_id',
        'talent_id',
        'amount_paid',
    ];

    public function scout(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scout_id');
    }

    public function talent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'talent_id');
    }
}
