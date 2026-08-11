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
        Schema::table('todos', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->dateTime('due_date')->nullable()->after('description');
            $table->string('image')->nullable()->after('due_date');
        });
    }

    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropColumn(['description', 'due_date', 'image']);
        });
    }
};
