import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon, Pencil, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { parseError } from "../../api";
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  PageHeader,
  Pagination,
} from "../../components/ui";
import {
  STATUSES,
  STATUS_STYLE,
  money,
  useDebounce,
  useFetch,
} from "../../utils";

export default function AdminProjects() {
  const [f, setF] = useState({ search: "", status: "", year: "", page: 1 });
  const search = useDebounce(f.search);
  const { data, loading, error, reload } = useFetch("/admin/projects", {
    ...f,
    search,
  });
  const years = useFetch("/public/filters");
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const changeStatus = async (p, status) => {
    try {
      await api.patch(`/admin/projects/${p.id}/status`, { status });
      toast.success(`Marked ${status}`);
    } catch (e) {
      toast.error(parseError(e).message);
    }
    reload();
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/projects/${del.id}`);
      toast.success("Project deleted");
      setDel(null);
      reload();
    } catch (e) {
      toast.error(parseError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Create projects, update their status, and log expenses."
      >
        <Link to="/admin/projects/create" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add project
        </Link>
      </PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_10rem_10rem]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="inp pl-9"
            placeholder="Search projects"
            value={f.search}
            onChange={(e) => setF({ ...f, search: e.target.value, page: 1 })}
          />
        </div>
        <select
          className="inp"
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value, page: 1 })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="inp"
          value={f.year}
          onChange={(e) => setF({ ...f, year: e.target.value, page: 1 })}
        >
          <option value="">All years</option>
          {years.data?.years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            rows={loading ? [] : data?.data}
            empty={loading ? "Loading…" : "No projects found"}
            columns={[
              {
                label: "Project",
                className: "font-semibold max-w-sm",
                render: (p) => {
                  const img = p.image_urls?.[0] || p.image_url;
                  return (
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/projects/${p.id}`}
                        className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 hover:opacity-90 transition block"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`grid h-full w-full place-items-center text-slate-400 ${
                            img ? "hidden" : ""
                          }`}
                        >
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to={`/admin/projects/${p.id}`}
                          className="line-clamp-2 hover:text-gov-forest hover:underline"
                          title={p.title}
                        >
                          {p.title}
                        </Link>
                      </div>
                    </div>
                  );
                },
              },
              { label: "Category", key: "category" },
              { label: "Allocated", render: (p) => money(p.amount_allocated) },
              {
                label: "Status",
                render: (p) => (
                  <select
                    aria-label="Status"
                    value={p.status}
                    onChange={(e) => changeStatus(p, e.target.value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      STATUS_STYLE[p.status]
                    }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ),
              },
              {
                label: "Actions",
                render: (p) => (
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/projects/${p.id}/edit`}
                      className="btn-outline !px-3 !py-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <Link
                      to={`/admin/projects/${p.id}/expenses`}
                      className="btn-outline !px-3 !py-1.5"
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      Expenses
                    </Link>
                    <button
                      className="btn-danger !px-3 !py-1.5"
                      onClick={() => setDel(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination
            page={data?.current_page}
            last={data?.last_page}
            onChange={(page) => setF({ ...f, page })}
          />
        </>
      )}
      <ConfirmDialog
        open={!!del}
        title="Delete project?"
        message={`"${del?.title}" and all of its expenses will be permanently deleted.`}
        onClose={() => setDel(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  );
}
