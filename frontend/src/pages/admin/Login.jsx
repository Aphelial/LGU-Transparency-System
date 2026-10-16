import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  Lock,
  Mail,
  Megaphone,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../auth";
import { parseError } from "../../api";

const features = [
  [Wallet, "Budget management", "Record yearly allocations per category."],
  [
    FolderKanban,
    "Project tracking",
    "Update status and log itemized expenses.",
  ],
  [
    Megaphone,
    "Public announcements",
    "Post programs, events, and relief updates.",
  ],
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (err) {
      const p = parseError(err);
      setError(p.fields.email || p.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Brand panel ---------- */}
      <aside className="relative hidden overflow-hidden bg-gov-deep text-white lg:flex lg:flex-col">
        <div className="relative flex items-center gap-3 p-12 pb-0">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-white/20">
            <svg
              viewBox="0 0 32 32"
              className="h-7 w-7"
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
          <div className="leading-tight">
            <p className="text-sm font-bold">Municipality</p>
            <p className="text-xs font-semibold text-malachite-300">
              LGU Transparency Portal
            </p>
          </div>
        </div>

        <div className="relative my-auto px-12 py-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-malachite-400/30 bg-malachite-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-malachite-300">
            <span
              className="h-1.5 w-1.5 rounded-full bg-malachite-400"
              aria-hidden="true"
            />
            Republic of the Philippines
          </span>
          <h2 className="mt-5 max-w-lg text-[30px] font-bold leading-[1.2] xl:text-[34px]">
            Open, accountable{" "}
            <span className="text-malachite-400">local governance.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-malachite-100/80">
            Manage the municipality&apos;s records and keep every resident
            informed about where public funds go.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(([Icon, title, text]) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-malachite-300 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-sm text-malachite-100/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-wrap items-center gap-3 border-t border-white/10 px-12 py-6 text-xs text-malachite-200/80">
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-bold text-white">
            SDG 16
          </span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-bold text-white">
            SDG 11
          </span>
          <span>
            Peace, Justice and Strong Institutions · Sustainable Cities and
            Communities
          </span>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="relative grid place-items-center bg-gov-surface p-6">
        <div className="relative w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-gov-forest">
              <svg
                viewBox="0 0 32 32"
                className="h-7 w-7"
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
            <p className="text-sm font-bold leading-tight text-gov-forest">
              LGU Transparency Portal
            </p>
          </div>

          <form
            onSubmit={submit}
            className="animate-fadeUp rounded-2xl border border-slate-200 bg-white p-8 shadow-lift sm:p-10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gov-navy">
                  Welcome back
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Sign in to the admin panel to manage records.
                </p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-malachite-50 text-malachite-700">
                <ShieldCheck className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email address
                </span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    className="inp !py-3 pl-11"
                    placeholder="you@municipality.gov.ph"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                  <input
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="inp !py-3 pl-11 pr-12"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-gov-forest"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-slate-200 bg-malachite-50 p-3 text-sm font-semibold text-malachite-800"
                >
                  {error}
                </p>
              )}

              <button
                className="btn-primary group w-full !py-3.5 text-base"
                disabled={busy}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {busy ? "Signing in…" : "Log in"}
                {!busy && (
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                )}
              </button>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Authorized staff only
              </span>
              <Link
                to="/"
                className="font-semibold text-malachite-800 hover:underline"
              >
                Back to public site
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
