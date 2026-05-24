<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('type')->default('text')->after('body'); // text, voice, image
            $table->string('media_path')->nullable()->after('type');
            $table->unsignedInteger('duration')->nullable()->after('media_path'); // seconds for voice
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'media_path', 'duration']);
        });
    }
};
