# LGU Transparency System

A public portal for municipal budgets, projects, expenses, and announcements, with an authenticated admin area for maintaining records. Supports open and accountable local governance (SDG 16 and SDG 11).

## Requirements

- PHP 8.2 or newer with SQLite, fileinfo, OpenSSL, PDO, and cURL extensions enabled
- Composer 2
- Node.js 20.19+ (or 22.12+) and npm
- Git

The backend uses SQLite by default for local development; no database server is required.

## Run locally on Windows

Clone the repository:

```powershell
git clone https://github.com/peteashercequena-bit/LGU-Transparency-System.git
cd LGU-Transparency-System
```

Prepare the backend in PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
if (!(Test-Path database/database.sqlite)) { New-Item database/database.sqlite -ItemType File | Out-Null }
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Keep that terminal open. In a second terminal, from the repository root, install and start the frontend:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend API URL is configurable in `frontend/.env.local`; its example defaults to `http://127.0.0.1:8000/api`.

The demo seeder creates an administrator account:

- Email: `admin@gmail.com`
- Password: `admin123`

These are development/demo credentials only. Do not use them in a deployed system.

## Build the frontend

```powershell
cd frontend
npm ci
npm run build
```

## Project image uploads

Uploaded project images are stored locally under `backend/storage/app/public` and served through `backend/public/storage`. The setup above creates the Laravel storage link. Local database files and uploaded user images are intentionally excluded from Git; demo data can be recreated with `php artisan migrate --seed`.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Laravel 12 REST API, Sanctum, SQLite by default
