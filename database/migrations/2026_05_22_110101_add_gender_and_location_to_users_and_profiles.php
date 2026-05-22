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
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('role');
        });

        Schema::table('talent_profiles', function (Blueprint $table) {
            $table->string('city')->nullable()->after('nationality');
            $table->string('country')->nullable()->after('city');
            $table->decimal('latitude', 10, 8)->nullable()->after('country');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('gender');
        });

        Schema::table('talent_profiles', function (Blueprint $table) {
            $table->dropColumn(['city', 'country', 'latitude', 'longitude']);
        });
    }
};
