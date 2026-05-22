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
        Schema::create('talent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('display_name');
            $table->date('date_of_birth');
            $table->string('nationality');
            $table->enum('dominant_foot', ['left', 'right', 'both']);
            $table->decimal('height_cm', 5, 2);
            $table->decimal('weight_kg', 5, 2);
            $table->enum('position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST']);
            $table->string('secondary_position')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('talent_profiles');
    }
};
