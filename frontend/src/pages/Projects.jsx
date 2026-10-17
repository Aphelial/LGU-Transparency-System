import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon, LayoutGrid, List, Search } from "lucide-react";
import {
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
  StatusBadge,
} from "../components/ui";
import { STATUSES, money, useDebounce, useFetch } from "../utils";

export default function Projects() {
  const [f, setF] = useState({
    search: "",
    year: "",
    category: "",
    status: "",
    page: 1,
  });
  const [view, setView] = useState("cards");
  const search = useDebounce(f.search);
  const filters = useFetch("/public/filters");
  const { data, loading, error, reload } = useFetch("/public/projects", {
    ...f,
    search,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, page: 1 });

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every municipal project, with its status and budget."
      >
        <div
          className="flex rounded-lg border border-slate-300 bg-white p-0.5"
          role="group"
          aria-label="View"
        >
          {[
            ["cards", LayoutGrid],
            ["table", List],
          ].map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={`${v} view`}
              className={`rounded-md p-2 ${
                view === v ? "bg-gov-forest text-white" : "text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card md:grid-cols-[1fr_repeat(3,10rem)]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="inp pl-9"
            placeholder="Search projects by keyword"
            value={f.search}
            onChange={set("search")}
            aria-label="Search projects"
          />
        </div>
        <select
          className="inp"
          value={f.year}
          onChange={set("year")}
          aria-label="Year"
        >
          <option value="">All years</option>
          {(filters.data?.project_years || filters.data?.years || []).map(
            (y) => (
              <option key={y}>{y}</option>
            )
          )}
        </select>
        <select
          className="inp"
          value={f.category}
          onChange={set("category")}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {filters.data?.categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="inp"
          value={f.status}
          onChange={set("status")}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : !data.data.length ? (
        <EmptyState
          title="No projects match your search"
          hint="Clear a filter or try different keywords."
        />
      ) : (
        <>
          {view === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((p) => {
                const img = p.image_urls?.[0] || p.image_url;
                return (
                  <Card key={p.id} className="group flex flex-col overflow-hidden transition hover:shadow-card-hover">
                    <div className="relative grid h-44 place-items-center overflow-hidden bg-slate-100">
                      {img ? (
                        <img
                          src={img}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={`grid h-full w-full place-items-center text-slate-400 ${img ? "hidden" : ""}`}>
                        <ImageIcon className="h-9 w-9 text-slate-300" />
                      </div>
                      <span className="absolute left-3 top-3">
                        <StatusBadge status={p.status} />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="font-bold leading-snug text-gov-navy group-hover:text-gov-forest transition-colors">
                        {p.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {p.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Budget
                        </span>
                        <span className="text-sm font-bold text-gov-forest">
                          {money(p.amount_allocated)}
                        </span>
                      </div>
                      <Link to={`/projects/${p.id}`} className="btn-outline mt-4">
                        View details
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <DataTable
              rows={data.data}
              columns={[
                {
                  label: "Project",
                  className: "font-semibold max-w-sm",
                  render: (p) => {
                    const img = p.image_urls?.[0] || p.image_url;
                    return (
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/projects/${p.id}`}
                          className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 block hover:opacity-90 transition"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={p.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={`grid h-full w-full place-items-center text-slate-400 ${img ? "hidden" : ""}`}>
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        </Link>
                        <Link
                          className="font-semibold text-gov-navy hover:text-gov-forest hover:underline line-clamp-2"
                          to={`/projects/${p.id}`}
                        >
                          {p.title}
                        </Link>
                      </div>
                    );
                  },
                },
                { label: "Category", key: "category" },
                { label: "Year", render: (p) => p.start_date?.slice(0, 4) },
                { label: "Budget", render: (p) => money(p.amount_allocated) },
                {
                  label: "Status",
                  render: (p) => <StatusBadge status={p.status} />,
                },
              ]}
            />
          )}
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
