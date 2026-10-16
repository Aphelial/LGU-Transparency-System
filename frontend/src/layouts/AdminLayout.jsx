import { Suspense, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../auth";
import PageTransition from "../components/PageTransition";
import RouteLoading from "../components/RouteLoading";
import { Brand } from "./PublicLayout";

const nav = [
  ["/admin", "Dashboard", LayoutDashboard, true],
  ["/admin/budgets", "Budgets", Wallet],
  ["/admin/projects", "Projects", FolderKanban],
  ["/admin/announcements", "Announcements", Megaphone],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const out = async () => {
    await logout();
    navigate("/admin/login");
  };
  const item = ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-malachite-100/80 hover:bg-white/5 hover:text-white"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col bg-gov-deep p-4">
      <div className="mb-8 mt-1 px-1">
        <Brand light />
      </div>
      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-malachite-300/70">
        Management
      </p>
      <nav
        className="space-y-1"
        onClick={() => setOpen(false)}
        aria-label="Admin"
      >
        {nav.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} className={item}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-malachite-500 font-bold text-gov-deep">
            {user?.name?.[0] || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {user?.name}
            </p>
            <p className="flex items-center gap-1 text-xs text-malachite-300">
              <ShieldCheck className="h-3 w-3" />
              Administrator
            </p>
          </div>
        </div>
        <button
          onClick={out}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gov-deep/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="animate-fadeUp absolute inset-y-0 left-0 w-64 shadow-lift">
            {sidebar}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
        <button
          className="rounded-lg border border-slate-200 p-2 text-gov-forest lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="hidden items-center gap-2 text-sm font-bold text-gov-forest lg:flex">
          <span
            className="h-2 w-2 rounded-full bg-malachite-500"
            aria-hidden="true"
          />
          Admin Panel
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:block">
            Signed in as <strong className="text-gov-navy">{user?.name}</strong>
          </span>
          <button onClick={out} className="btn-outline !py-2 lg:hidden">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="p-4 sm:p-8">
        <PageTransition>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
    </div>
  );
}
