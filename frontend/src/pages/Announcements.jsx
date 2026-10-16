import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Card,
  CategoryBadge,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
} from "../components/ui";
import { fmtDate, useDebounce, useFetch } from "../utils";

export default function Announcements() {
  const [f, setF] = useState({ search: "", category: "", date: "", page: 1 });
  const search = useDebounce(f.search);
  const { data, loading, error, reload } = useFetch("/public/announcements", {
    ...f,
    search,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, page: 1 });

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Programs, events, and relief distributions from the municipality."
      />
      <div className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card md:grid-cols-[1fr_11rem_11rem]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="inp pl-9"
            placeholder="Search announcements"
            value={f.search}
            onChange={set("search")}
            aria-label="Search announcements"
          />
        </div>
        <select
          className="inp"
          value={f.category}
          onChange={set("category")}
          aria-label="Category"
        >
          <option value="">All categories</option>
          <option>Program</option>
          <option>Event</option>
          <option>Relief</option>
        </select>
        <input
          type="date"
          className="inp"
          value={f.date}
          onChange={set("date")}
          aria-label="Date"
        />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !data.data.length ? (
        <EmptyState
          title="No announcements found"
          hint="Try another category or date."
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((a) => (
              <Card
                key={a.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h2 className="font-bold text-gov-navy">{a.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {a.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <CategoryBadge category={a.category} />
                    <span className="text-xs text-slate-500">
                      {fmtDate(a.date)}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/announcements/${a.id}`}
                  className="btn-outline shrink-0"
                >
                  Read more
                </Link>
              </Card>
            ))}
          </div>
          <Pagination
            page={data.current_page}
            last={data.last_page}
            onChange={(page) => setF({ ...f, page })}
          />
        </>
      )}
    </>
  );
}
