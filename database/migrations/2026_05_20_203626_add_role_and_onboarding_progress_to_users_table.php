<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['talent', 'parent', 'school', 'club', 'scout', 'admin'])->after('password')->default('talent');
            $table->string('avatar_path')->nullable()->after('role');
            $table->json('onboarding_progress')->nullable()->after('avatar_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'avatar_path', 'onboarding_progress']);
        });
    }
};
