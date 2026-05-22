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
        Schema::create('parent_talent', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('talent_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['parent_user_id', 'talent_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_talent');
    }
};
