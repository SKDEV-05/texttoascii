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
        Schema::create('pitch_avatars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_profile_id')->constrained()->onDelete('cascade');
            $table->float('position_x'); // 0-100%
            $table->float('position_y'); // 0-100%
            $table->enum('avatar_style', ['GK', 'DEF', 'MID', 'ATT', 'ST']);
            $table->string('custom_color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pitch_avatars');
    }
};
