import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  X,
} from "lucide-react";
import { CAT_STYLE, STATUS_STYLE } from "../utils";

export const Card = ({ className = "", children }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}
  >
    {children}
  </div>
);

export const Skeleton = ({ className = "h-24" }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
);

export const PageSkeleton = () => (
  <div className="space-y-4" aria-busy="true">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} />
      ))}
    </div>
    <Skeleton className="h-72" />
  </div>
);

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="border-slate-200 p-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-malachite-50 text-malachite-700">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <p className="mt-4 text-lg font-bold">We couldn't load this page</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-5">
          Try again
        </button>
      )}
    </Card>
  );
}

export function EmptyState({ title = "Nothing here yet", hint }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-malachite-50 text-malachite-700">
        <Inbox className="h-7 w-7" />
      </span>
      <p className="mt-4 font-bold">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

const pill =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";
export const StatusBadge = ({ status }) => (
  <span className={`${pill} ${STATUS_STYLE[status]}`}>
    <span
      className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
      aria-hidden="true"
    />
    {status}
  </span>
);
export const CategoryBadge = ({ category }) => (
  <span className={`${pill} ${CAT_STYLE[category]}`}>{category}</span>
);

export function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="stat-content min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p
            className={`stat-number mt-2 whitespace-nowrap ${
              accent || "text-gov-navy"
            }`}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center text-malachite-700">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-gov-navy sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

export const ChartCard = ({ title, action, children, className = "" }) => (
  <Card className={`overflow-hidden ${className}`}>
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
      <h2 className="text-sm font-bold text-gov-forest">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

export function Field({ label, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {error && (
        <span
          role="alert"
          className="mt-1.5 flex items-center gap-1 rounded-md bg-malachite-50 px-2 py-1 text-xs font-semibold text-malachite-800"
        >
          {error}
        </span>
      )}
    </label>
  );
}

export function Pagination({ page, last, onChange }) {
  if (!last || last <= 1) return null;
  const pages = [];
  for (let i = 1; i <= last; i++)
    if (i === 1 || i === last || Math.abs(i - page) <= 1) pages.push(i);
  const items = pages.flatMap((p, i) =>
    i && p - pages[i - 1] > 1 ? ["…", p] : [p]
  );
  const base =
    "grid h-10 min-w-10 place-items-center rounded-lg border px-2 text-sm font-semibold transition";
  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        className={`${base} border-slate-300 bg-white hover:border-malachite-500 hover:bg-malachite-50 disabled:opacity-40`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {items.map((p, i) =>
        p === "…" ? (
          <span key={"d" + i} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${
              p === page
                ? "border-malachite-500 bg-malachite-500 font-bold text-gov-deep shadow-sm"
                : "border-slate-300 bg-white hover:border-malachite-500 hover:bg-malachite-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        className={`${base} border-slate-300 bg-white hover:border-malachite-500 hover:bg-malachite-50 disabled:opacity-40`}
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function Modal({ open, title, onClose, children, size = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-gov-deep/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-fadeUp w-full ${size} overflow-hidden rounded-2xl bg-white shadow-lift`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-gov-forest px-6 py-4 text-white">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  busy,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="max-w-md">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn bg-slate-700 text-white shadow-sm hover:bg-slate-800"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function DataTable({ columns, rows, empty }) {
  if (!rows?.length)
    return (
      <EmptyState
        title={empty || "No records found"}
        hint="Try changing your search or filters."
      />
    );
  return (
    <Card className="overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} className={`th ${c.className || ""}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr
                key={r.id ?? i}
                className="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-malachite-50/60"
              >
                {columns.map((c) => (
                  <td key={c.label} className={`td ${c.className || ""}`}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function UtilBar({ value }) {
  const v = Math.min(Number(value) || 0, 100);
  const over = value > 100;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2.5 w-full min-w-20 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full animate-grow ${
            over ? "bg-slate-700" : "bg-malachite-600"
          }`}
          style={{ "--w": `${v}%`, width: `${v}%` }}
        />
      </div>
      <span
        className={`w-12 text-right text-xs font-bold ${
          over ? "text-slate-700" : "text-gov-forest"
        }`}
      >
        {Number(value || 0).toFixed(0)}%
      </span>
    </div>
  );
}

export const BackLink = ({ to, children }) => (
  <Link
    to={to}
    className="group mb-5 inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-malachite-800 hover:text-gov-forest"
  >
    <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
    {children}
  </Link>
);
