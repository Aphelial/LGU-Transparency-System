import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Landmark,
  FolderKanban,
  PiggyBank,
  Receipt,
} from "lucide-react";
import {
  CategoryBadge,
  ChartCard,
  ErrorState,
  PageSkeleton,
  StatCard,
  StatusBadge,
  UtilBar,
  DataTable,
} from "../components/ui";
import ScrollReveal from "../components/ScrollReveal";
import { fmtDate, money, useFetch } from "../utils";

const BudgetBarChart = lazy(() =>
  import("../components/charts").then((module) => ({
    default: module.BudgetBarChart,
  }))
);
const DonutChart = lazy(() =>
  import("../components/charts").then((module) => ({
    default: module.DonutChart,
  }))
);

export default function Dashboard() {
  const [year, setYear] = useState("");
  const filters = useFetch("/public/filters");
  const { data, loading, error, reload } = useFetch("/public/dashboard", {
    fiscal_year: year,
  });
  const selectedYear =
    year ||
    data?.fiscal_year ||
    filters.data?.years?.[0] ||
    new Date().getFullYear();
  const years = [
    ...new Set([...(filters.data?.years || []), selectedYear].map(Number)),
  ].sort((a, b) => Number(b) - Number(a));
  return (
    <>
      <section className="relative left-1/2 isolate -mt-10 mb-10 flex min-h-[calc(100svh-68px)] w-screen -translate-x-1/2 flex-col items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10 text-center text-white">
        <img
          src="/municipal-hall.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        />
        <div
          className="hero-overlay absolute inset-0 z-0 bg-gov-deep/65"
          aria-hidden="true"
        />
        <div className="hero-enter hero-enter-1 relative z-10 mb-7 grid h-20 w-20 place-items-center rounded-2xl border border-white/60 bg-white/95 text-gov-forest shadow-card">
          <Landmark
            className="h-10 w-10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="hero-enter hero-enter-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90 sm:text-sm">
            Municipal Government · Public Information
          </p>
          <h1 className="hero-enter hero-enter-3 mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your municipality,
            <br className="hidden sm:block" /> in the open.
          </h1>
          <p className="hero-enter hero-enter-4 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            A public window into local budgets, projects, and community
            announcements. See how plans move forward and how public funds are
            used.
          </p>
          <div className="hero-enter hero-enter-5 mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/projects" className="btn-civic !px-5 !py-3">
              Explore municipal projects <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/budgets" className="btn-outline !px-5 !py-3">
              View public budgets
            </Link>
          </div>
        </div>
      </section>

      {loading && !data ? (
        <PageSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <ScrollReveal
            id="budget-overview"
            className="flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-malachite-700">
                Public financial records
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gov-navy">
                Budget overview
              </h2>
            </div>
            <select
              className="inp !w-auto"
              value={selectedYear}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Fiscal year"
            >
              {years.map((y) => (
                <option key={y} value={y} className="text-gov-navy">
                  Fiscal year {y}
                </option>
              ))}
            </select>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScrollReveal delay={0}>
              <StatCard
                label="Total budget"
                value={money(data.total_budget)}
                icon={Banknote}
              />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <StatCard
                label="Disbursed"
                value={money(data.disbursed)}
                icon={Receipt}
              />
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <StatCard
                label="Remaining"
                value={money(data.remaining)}
                icon={PiggyBank}
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <StatCard
                label="Total projects"
                value={data.total_projects}
                icon={FolderKanban}
              />
            </ScrollReveal>
          </div>

          <ScrollReveal defer placeholderClassName="min-h-[21rem]">
            <div className="grid gap-6 lg:grid-cols-3">
              <ChartCard
                title="Budget vs disbursed by category"
                className="lg:col-span-2"
              >
                <Suspense
                  fallback={
                    <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
                  }
                >
                  <BudgetBarChart data={data.by_category} />
                </Suspense>
              </ChartCard>
              <ChartCard title="Project status">
                <Suspense
                  fallback={
                    <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
                  }
                >
                  <DonutChart
                    data={data.status_counts}
                    nameKey="status"
                    valueKey="count"
                    statusColors
                  />
                </Suspense>
              </ChartCard>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <ChartCard title="Budget allocation by category">
              <DataTable
                rows={data.by_category}
                columns={[
                  {
                    label: "Category",
                    key: "category",
                    className: "font-semibold text-gov-navy",
                  },
                  { label: "Allocated", render: (r) => money(r.allocated) },
                  { label: "Disbursed", render: (r) => money(r.disbursed) },
                  {
                    label: "Utilization",
                    className: "w-64",
                    render: (r) => <UtilBar value={r.utilization} />,
                  },
                ]}
              />
            </ChartCard>
          </ScrollReveal>

          <ScrollReveal>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Latest announcements"
                action={
                  <Link to="/announcements" className="btn-outline !py-1.5">
                    View all
                  </Link>
                }
              >
                <ul className="divide-y divide-slate-100">
                  {data.latest_announcements.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/announcements/${a.id}`}
                        className="flex items-start justify-between gap-3 py-3.5 transition hover:text-malachite-700"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {a.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {fmtDate(a.date)}
                          </span>
                        </span>
                        <CategoryBadge category={a.category} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </ChartCard>
              <ChartCard
                title="Recent projects"
                action={
                  <Link to="/projects" className="btn-outline !py-1.5">
                    View all
                  </Link>
                }
              >
                <ul className="divide-y divide-slate-100">
                  {data.recent_projects.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/projects/${p.id}`}
                        className="flex items-start justify-between gap-3 py-3.5 transition hover:text-malachite-700"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {p.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {money(p.amount_allocated)}
                          </span>
                        </span>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </ChartCard>
            </div>
          </ScrollReveal>
        </div>
      )}
    </>
  );
}
