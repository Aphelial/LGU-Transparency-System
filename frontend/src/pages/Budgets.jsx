import { lazy, Suspense, useState } from "react";
import { Banknote, PiggyBank, Receipt } from "lucide-react";
import {
  ChartCard,
  DataTable,
  ErrorState,
  PageHeader,
  PageSkeleton,
  StatCard,
  UtilBar,
} from "../components/ui";
import { money, useFetch } from "../utils";

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

export default function Budgets() {
  const [year, setYear] = useState("");
  const filters = useFetch("/public/filters");
  const { data, loading, error, reload } = useFetch("/public/budgets", {
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
      <PageHeader
        title="Budgets overview"
        subtitle="How much was allocated, and where."
      >
        <select
          className="inp !w-auto"
          value={selectedYear}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Fiscal year"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              Fiscal year {y}
            </option>
          ))}
        </select>
      </PageHeader>
      {loading && !data ? (
        <PageSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total allocated"
              value={money(data.total_allocated)}
              icon={Banknote}
            />
            <StatCard
              label="Disbursed"
              value={money(data.disbursed)}
              icon={Receipt}
            />
            <StatCard
              label="Remaining"
              value={money(data.remaining)}
              icon={PiggyBank}
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <ChartCard title="Allocation by category" className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
                }
              >
                <BudgetBarChart data={data.breakdown} />
              </Suspense>
            </ChartCard>
            <ChartCard title="Share of budget" className="lg:col-span-2">
              <Suspense
                fallback={
                  <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
                }
              >
                <DonutChart
                  data={data.breakdown}
                  nameKey="category"
                  valueKey="allocated"
                  formatter={money}
                />
              </Suspense>
            </ChartCard>
          </div>
          <ChartCard title="Budget breakdown">
            <DataTable
              rows={data.breakdown}
              columns={[
                { label: "Fiscal year", key: "fiscal_year" },
                {
                  label: "Category",
                  key: "category",
                  className: "font-semibold",
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
        </div>
      )}
    </>
  );
}
