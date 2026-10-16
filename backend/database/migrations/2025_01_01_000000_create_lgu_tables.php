<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('admin')->after('email');
        });
 
        Schema::create('budgets', function (Blueprint $t) {
            $t->id();
            $t->unsignedSmallInteger('fiscal_year')->index();
            $t->string('category');
            $t->decimal('amount_allocated', 15, 2);
            $t->timestamps();
            $t->unique(['fiscal_year', 'category']);
        });
 
        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->foreignId('budget_id')->constrained()->restrictOnDelete();
            $t->string('title');
            $t->text('description')->nullable();
            $t->string('category');
            $t->decimal('amount_allocated', 15, 2);
            $t->string('contractor')->nullable();
            $t->string('location')->nullable();
            $t->enum('status', ['Planned', 'Ongoing', 'Completed', 'Delayed'])->default('Planned');
            $t->text('progress_notes')->nullable();
            $t->date('start_date')->nullable();
            $t->date('target_end_date')->nullable();
            $t->date('actual_end_date')->nullable();
            $t->string('image_path')->nullable();
            $t->string('progress_photo_path')->nullable();
            $t->timestamps();
            $t->index('status');
            $t->index('category');
        });
 
        Schema::create('project_expenses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('item_name');
            $t->unsignedInteger('quantity');
            $t->decimal('unit_cost', 15, 2);
            $t->decimal('total_cost', 15, 2);
            $t->date('date_purchased');
            $t->timestamps();
        });
 
        Schema::create('announcements', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('description');
            $t->enum('category', ['Program', 'Event', 'Relief']);
            $t->date('date');
            $t->unsignedInteger('beneficiaries_count')->default(0);
            $t->string('venue')->nullable();
            $t->string('banner_image')->nullable();
            $t->timestamps();
            $t->index(['category', 'date']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('project_expenses');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('budgets');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
