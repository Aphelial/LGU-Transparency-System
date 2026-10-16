import { useParams } from "react-router-dom";
import { CalendarClock, ImageIcon } from "lucide-react";
import {
  BackLink,
  Card,
  ChartCard,
  DataTable,
  ErrorState,
  PageSkeleton,
  StatusBadge,
  UtilBar,
} from "../components/ui";
import { fmtDate, money, useFetch } from "../utils";

const Row = ({ k, v }) => (
  <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
    <dt className="text-slate-500">{k}</dt>
    <dd className="text-right font-semibold text-gov-navy">{v || "—"}</dd>
  </div>
);

export default function ProjectDetail() {
  const { id } = useParams();
  const {
    data: p,
    loading,
    error,
    reload,
  } = useFetch(`/public/projects/${id}`);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const spent = Number(p.spent || 0);
  const pct = p.amount_allocated ? (spent / p.amount_allocated) * 100 : 0;

  return (
    <>
      <BackLink to="/projects">Back to projects</BackLink>

      <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gov-forest px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-malachite-200">
          <span>Official Project Record</span>
          <span>Ref. No. {String(p.id).padStart(4, "0")}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">{p.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{p.location}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
      </header>

      {p.status === "Delayed" && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--color-delayed)]/30 border-l-4 border-l-[var(--color-delayed)] bg-[var(--color-delayed-soft)] p-4 text-sm text-[var(--color-delayed)]"
        >
          <CalendarClock className="h-5 w-5 shrink-0" />
          This project is delayed. The target completion date is{" "}
          <strong>{fmtDate(p.target_end_date)}</strong>.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Project description">
            <p className="leading-relaxed text-slate-700">
              {p.description || "No description provided."}
            </p>
            {p.image_urls?.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.image_urls.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`${p.title} project ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full rounded-xl border border-slate-200 object-cover"
                  />
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Progress notes">
            <p className="text-sm leading-relaxed text-slate-700">
              {p.progress_notes || "No progress notes yet."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(p.progress_photo_urls?.length
                ? p.progress_photo_urls
                : [p.photo_url || p.image_url].filter(Boolean)
              ).map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`Project progress ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full rounded-xl border border-slate-200 object-cover"
                />
              ))}
              {!p.progress_photo_urls?.length &&
                !p.photo_url &&
                !p.image_url && (
                  <div className="grid aspect-video place-items-center rounded-xl border border-slate-200 bg-slate-100">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>
                )}
            </div>
          </ChartCard>

          <ChartCard title="Itemized expenses">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">Budget utilization</span>
              <span className="font-semibold">
                {money(spent)} of {money(p.amount_allocated)}
              </span>
            </div>
            <div className="mb-5">
              <UtilBar value={pct} />
            </div>
            <DataTable
              rows={p.expenses}
              empty="No expenses recorded yet"
              columns={[
                {
                  label: "Item",
                  key: "item_name",
                  className: "font-semibold text-gov-navy",
                },
                { label: "Qty", key: "quantity" },
                { label: "Unit cost", render: (e) => money(e.unit_cost) },
                { label: "Total cost", render: (e) => money(e.total_cost) },
                {
                  label: "Date purchased",
                  render: (e) => fmtDate(e.date_purchased),
                },
              ]}
            />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-malachite-50 px-4 py-3">
              <span className="text-sm font-bold uppercase tracking-wide text-gov-forest">
                Total spent
              </span>
              <span className="text-lg font-bold text-gov-forest">
                {money(spent)}
              </span>
            </div>
          </ChartCard>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gov-forest">
                Project details
              </h2>
            </div>
            <dl className="px-5 py-2">
              <Row k="Category" v={p.category} />
              <Row
                k="Linked budget"
                v={`FY ${p.budget?.fiscal_year} – ${p.budget?.category}`}
              />
              <Row k="Budget allocated" v={money(p.amount_allocated)} />
              <Row k="Contractor" v={p.contractor} />
              <Row k="Location" v={p.location} />
              <Row k="Start date" v={fmtDate(p.start_date)} />
              <Row k="Target end date" v={fmtDate(p.target_end_date)} />
              <Row k="Actual end date" v={fmtDate(p.actual_end_date)} />
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}
