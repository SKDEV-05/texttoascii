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
            // Updating role enum to group parent/talent and scout/club
            $table->enum('role', ['talent', 'parent', 'scout_club', 'admin'])->default('talent')->change();
        });

        Schema::table('talent_profiles', function (Blueprint $table) {
            // Adding new positions: AMF, CMD, CF
            $table->enum('position', [
                'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 
                'AMF', 'CMD', 'CF'
            ])->change();
        });

        Schema::table('institution_profiles', function (Blueprint $table) {
            // Grouping school, club, and scout_agency under type
            $table->enum('type', ['school', 'club', 'scout_agency', 'scout_club'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['talent', 'parent', 'school', 'club', 'scout', 'admin'])->default('talent')->change();
        });

        Schema::table('talent_profiles', function (Blueprint $table) {
            $table->enum('position', ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])->change();
        });

        Schema::table('institution_profiles', function (Blueprint $table) {
            $table->enum('type', ['school', 'club', 'scout_agency'])->change();
        });
    }
};
