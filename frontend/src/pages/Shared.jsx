import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export const NotFound = () => (
  <div className="grid place-items-center py-24 text-center">
    <p className="text-8xl font-bold text-malachite-600">404</p>
    <h1 className="mt-3 text-xl font-bold">Page not found</h1>
    <p className="mt-1 text-sm text-slate-500">
      The page you are looking for does not exist or was moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to home
    </Link>
  </div>
);

export const Unauthorized = () => (
  <div className="grid place-items-center py-24 text-center">
    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-malachite-50 text-malachite-700 ring-8 ring-malachite-50/60">
      <Lock className="h-8 w-8" />
    </span>
    <h1 className="mt-4 text-xl font-bold">Access denied</h1>
    <p className="mt-1 text-sm text-slate-500">
      You need to log in as admin to view this page.
    </p>
    <div className="mt-6 flex gap-2">
      <Link to="/admin/login" className="btn-primary">
        Go to login
      </Link>
      <Link to="/" className="btn-outline">
        Home
      </Link>
    </div>
  </div>
);
