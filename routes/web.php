<?php

use App\Http\Controllers\CallController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TalentController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('videos.index');
    }

    return Inertia::render('welcome');
})->name('home');
Route::get('videos', [VideoController::class, 'index'])->name('videos.index');
Route::get('videos/{video}', [VideoController::class, 'show'])->name('videos.show');

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

    Route::post('parent/talents', [OnboardingController::class, 'createChildTalent'])->name('parent.talents.store');

    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::post('start/{user}', [ChatController::class, 'startConversation'])->name('start');
        Route::get('{conversation}', [ChatController::class, 'show'])->name('show');
        Route::post('{conversation}', [ChatController::class, 'store'])->name('store');
        Route::post('{conversation}/pay', [ChatController::class, 'pay'])->name('pay');
        Route::post('{conversation}/voice', [ChatController::class, 'voice'])->name('voice');
        Route::post('{conversation}/read', [ChatController::class, 'markRead'])->name('read');
    });

    // Call routes
    Route::prefix('call')->name('call.')->group(function () {
        Route::post('{conversation}/start', [CallController::class, 'start'])->name('start');
        Route::post('{conversation}/signal', [CallController::class, 'signal'])->name('signal');
    });

    // Report routes
    Route::post('reports', [ReportController::class, 'store'])->name('reports.store');

    // Video interaction routes (auth required)
    Route::prefix('videos')->name('videos.')->group(function () {
        Route::post('/', [VideoController::class, 'store'])->name('store');
        Route::post('{video}/comments', [VideoController::class, 'storeComment'])->name('comments.store');
        Route::post('{video}/like', [VideoController::class, 'toggleLike'])->name('like.toggle');
    });

    // Follow routes
    Route::post('users/{user}/follow', [FollowController::class, 'toggle'])->name('users.follow');

    // Talent routes — scouts only
    Route::middleware('role:scout_club')->prefix('talents')->name('talents.')->group(function () {
        Route::get('/', [TalentController::class, 'index'])->name('index');
        Route::get('{talent}', [TalentController::class, 'show'])->name('show');
        Route::post('{talent}/unlock', [TalentController::class, 'unlockContact'])->name('unlock');
    });

    // Wallet routes
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('index');
        Route::post('topup', [WalletController::class, 'topup'])->name('topup');
        Route::post('transfer', [WalletController::class, 'transfer'])->name('transfer');
    });

    // Subscription routes
    Route::post('subscription/buy-pro', [SubscriptionController::class, 'buyPro'])->name('subscription.buy-pro');
});

require __DIR__.'/settings.php';
