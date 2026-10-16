import { useParams } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import {
  BackLink,
  Card,
  CategoryBadge,
  ErrorState,
  PageSkeleton,
} from "../components/ui";
import { fmtDate, useFetch } from "../utils";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const {
    data: a,
    loading,
    error,
    reload,
  } = useFetch(`/public/announcements/${id}`);
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const Row = ({ k, v }) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-right font-semibold text-gov-navy">{v}</dd>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink to="/announcements">Back to announcements</BackLink>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="bg-gov-forest px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-malachite-200">
          Official Announcement
        </div>
        <div className="grid aspect-[21/8] place-items-center overflow-hidden bg-slate-100">
          {a.banner_url ? (
            <img
              src={a.banner_url}
              alt={a.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-slate-300" />
          )}
        </div>
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <CategoryBadge category={a.category} />
              <span className="text-sm text-slate-500">{fmtDate(a.date)}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold">{a.title}</h1>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-700">
              {a.description}
            </p>
          </div>
          <aside>
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gov-forest">
                  Details
                </h2>
              </div>
              <dl className="px-5 py-2">
                <Row k="Category" v={a.category} />
                <Row k="Date" v={fmtDate(a.date)} />
                {a.venue && <Row k="Venue" v={a.venue} />}
                <Row
                  k="Beneficiaries"
                  v={`${Number(
                    a.beneficiaries_count
                  ).toLocaleString()} residents`}
                />
              </dl>
            </Card>
          </aside>
        </div>
      </article>
    </div>
  );
}
