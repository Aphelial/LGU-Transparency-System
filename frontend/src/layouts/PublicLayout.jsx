import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import PageTransition from "../components/PageTransition";
import RouteLoading from "../components/RouteLoading";

const links = [
  ["/", "Dashboard"],
  ["/projects", "Projects"],
  ["/budgets", "Budgets"],
  ["/announcements", "Announcements"],
];

export function Brand({ light }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg border ${
          light ? "border-white/20" : "border-slate-200"
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          className={`h-6 w-6 ${light ? "text-white" : "text-gov-forest"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12 16 6l11 6H5Z" />
          <path d="M8 14v9m5-9v9m6-9v9m5-9v9M5 26h22M6 29h20" />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={`block text-sm font-bold ${
            light ? "text-white" : "text-gov-forest"
          }`}
        >
          Municipal Government
        </span>
        <span
          className={`block text-xs font-semibold ${
            light ? "text-malachite-300" : "text-slate-500"
          }`}
        >
          Public Budget &amp; Projects
        </span>
      </span>
    </Link>
  );
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) =>
    `flex h-full items-center px-4 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-gov-forest text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-gov-forest"
    }`;
  const mcls = ({ isActive }) =>
    `block px-4 py-3 text-sm font-semibold transition-colors ${
      isActive ? "bg-gov-forest text-white" : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-[68px] items-center justify-between px-6 sm:px-10">
          <Brand />
          <nav
            className="hidden h-full items-stretch md:flex"
            aria-label="Main"
          >
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={cls}>
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            className="rounded-lg border border-slate-200 p-2 text-gov-forest md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            className="animate-fadeUp space-y-1 border-t border-slate-200 bg-white px-4 py-3 shadow-card md:hidden"
            onClick={() => setOpen(false)}
          >
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={mcls}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <PageTransition>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>

      <footer className="border-t border-slate-200 bg-gov-deep text-malachite-100">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-4 sm:flex-row sm:items-center">
          <Brand light />
          <p className="max-w-md text-xs leading-relaxed text-malachite-200/80">
            Open local governance: every peso allocated, every project, and
            every program, available to every resident. Supports SDG 16 (Peace,
            Justice and Strong Institutions) and SDG 11 (Sustainable Cities and
            Communities).
          </p>
        </div>
      </footer>
    </div>
  );
}
