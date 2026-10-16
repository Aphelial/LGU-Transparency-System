<?php
 
use App\Http\Controllers\Admin\{AnnouncementController, AuthController, BudgetController, DashboardController, ExpenseController, ProjectController};
use App\Http\Controllers\Api\PublicController;
use Illuminate\Support\Facades\Route;
 
Route::prefix('public')->controller(PublicController::class)->group(function () {
    Route::get('filters', 'filters');
    Route::get('dashboard', 'dashboard');
    Route::get('projects', 'projects');
    Route::get('projects/{id}', 'project');
    Route::get('budgets', 'budgets');
    Route::get('announcements', 'announcements');
    Route::get('announcements/{id}', 'announcement');
});
 
Route::post('admin/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
 
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::get('dashboard', DashboardController::class);
 
    Route::apiResource('budgets', BudgetController::class);
    Route::patch('projects/{project}/status', [ProjectController::class, 'status']);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('projects.expenses', ExpenseController::class)->shallow();
    Route::apiResource('announcements', AnnouncementController::class);
});
