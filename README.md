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

## Deploy with Supabase and Vercel

The frontend runs on Vercel. The Laravel API must run on a PHP host separately; `render.yaml` and `backend/Dockerfile` configure it as a Render web service. The API uses Supabase PostgreSQL, and its startup runs Laravel migrations automatically.

1. In Render, create a **Blueprint** from this GitHub repository and select `render.yaml`.
2. In Supabase, open **Connect** for this project and copy the PostgreSQL connection string. Use the session pooler connection for the Render `DB_URL` secret; preserve its username, password, host, and port, and ensure the URL includes `sslmode=require`. Do not use the Supabase anon key or service-role key as a database password.
3. Supply the private Render values when prompted: `DB_URL`, `APP_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Generate `APP_KEY` locally from `backend` with `php artisan key:generate --show`; use a unique administrator password of at least 12 characters. Enter secrets only in Render's dashboard, not in Git or chat. The API will create the initial admin account once; later restarts won't reset its password.
4. After Render finishes deploying, set the Vercel project's production environment variable `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`, then redeploy the Vercel frontend.
5. Test the API health endpoint at `https://<your-render-service>.onrender.com/up`, then open the Vercel site and sign in at `/admin/login` with the administrator email and password configured in Render.

Do not run `php artisan db:seed` in production: the development seeder uses a known demo password and inserts sample records. The initial admin account is created separately from the private Render environment variables. Render's local container filesystem is ephemeral, so uploaded project media needs durable object storage (for example, Supabase Storage) before relying on uploads in production.
