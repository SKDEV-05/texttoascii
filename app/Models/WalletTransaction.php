<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'description',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
