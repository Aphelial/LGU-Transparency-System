<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ProvisionAdmin extends Command
{
    protected $signature = 'app:provision-admin';

    protected $description = 'Create the configured initial administrator if the account does not exist';

    public function handle(): int
    {
        $email = trim((string) env('ADMIN_EMAIL'));
        $password = (string) env('ADMIN_PASSWORD');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
            $this->error('Set a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.');

            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $created = ! $user->exists;

        if ($created) {
            $user->name = (string) env('ADMIN_NAME', 'Municipal Admin');
            $user->password = Hash::make($password);
        }

        $user->role = 'admin';
        $user->save();

        $this->info($created ? 'Initial administrator created.' : 'Administrator account is ready.');

        return self::SUCCESS;
    }
}
