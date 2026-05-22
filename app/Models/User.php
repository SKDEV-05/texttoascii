<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'role', 'gender', 'avatar_path', 'onboarding_progress'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'onboarding_progress' => 'array',
        ];
    }

    public function talentProfile(): HasOne
    {
        return $this->hasOne(TalentProfile::class);
    }

    public function institutionProfile(): HasOne
    {
        return $this->hasOne(InstitutionProfile::class);
    }

    public function managedTalents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_talent', 'parent_user_id', 'talent_user_id');
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'parent_talent', 'talent_user_id', 'parent_user_id');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(Video::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latestOfMany();
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'initiator_id')->orWhere('recipient_id', $this->id);
    }

    /**
     * Check if the user can upload more videos.
     * Free users are limited to 5 videos.
     */
    public function canUploadVideo(): bool
    {
        if ($this->activeSubscription()->exists()) {
            return true;
        }

        return $this->videos()->count() < 5;
    }

    /**
     * Check if the scout/club can send more messages.
     * Free scouts/clubs are limited to 3 messages.
     */
    public function canSendMessage(): bool
    {
        if ($this->activeSubscription()->exists()) {
            return true;
        }

        if ($this->role !== 'scout_club') {
            return true;
        }

        return $this->messages()->count() < 3;
    }

    /**
     * Check if the user can see talent contact information.
     * Requires an active subscription for scouts/clubs.
     */
    public function canSeeContactInfo(): bool
    {
        if ($this->role === 'admin' || $this->role === 'talent' || $this->role === 'parent') {
            return true;
        }

        return $this->activeSubscription()->exists();
    }
}
