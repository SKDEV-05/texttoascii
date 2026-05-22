<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\TalentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Onboarding routes
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('role-selection', [OnboardingController::class, 'showRoleSelection'])->name('role-selection');
        Route::post('role-selection', [OnboardingController::class, 'selectRole']);
        
        Route::get('talent-details', [OnboardingController::class, 'showTalentDetails'])->name('talent-details');
        Route::post('talent-details', [OnboardingController::class, 'saveTalentDetails']);
        
        Route::get('institution-details', [OnboardingController::class, 'showInstitutionDetails'])->name('institution-details');
        Route::post('institution-details', [OnboardingController::class, 'saveInstitutionDetails']);
    });

    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('{conversation}', [ChatController::class, 'show'])->name('show');
        Route::post('{conversation}', [ChatController::class, 'store'])->name('store');
    });

    // Video routes
    Route::prefix('videos')->name('videos.')->group(function () {
        Route::get('/', [VideoController::class, 'index'])->name('index');
        Route::post('/', [VideoController::class, 'store'])->name('store');
        Route::get('{video}', [VideoController::class, 'show'])->name('show');
    });

    // Talent routes
    Route::prefix('talents')->name('talents.')->group(function () {
        Route::get('{talent}', [TalentController::class, 'show'])->name('show');
    });
});

require __DIR__.'/settings.php';
