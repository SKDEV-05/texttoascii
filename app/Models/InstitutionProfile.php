<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstitutionProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'institution_name',
        'country',
        'city',
        'type',
        'website',
        'verified',
    ];

    protected $casts = [
        'verified' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
