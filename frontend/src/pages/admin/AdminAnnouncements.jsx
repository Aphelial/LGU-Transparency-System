import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { parseError } from "../../api";
import {
  CategoryBadge,
  ConfirmDialog,
  DataTable,
  ErrorState,
  PageHeader,
  Pagination,
} from "../../components/ui";
import { fmtDate, useDebounce, useFetch } from "../../utils";

export default function AdminAnnouncements() {
  const [f, setF] = useState({ search: "", category: "", page: 1 });
  const search = useDebounce(f.search);
  const { data, loading, error, reload } = useFetch("/admin/announcements", {
    ...f,
    search,
  });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/announcements/${del.id}`);
      toast.success("Announcement deleted");
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
        title="Announcements"
        subtitle="Programs, events, and relief distributions."
      >
        <Link to="/admin/announcements/create" className="btn-primary">
          <Plus className="h-4 w-4" />
          Post announcement
        </Link>
      </PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="inp pl-9"
            placeholder="Search announcements"
            value={f.search}
            onChange={(e) => setF({ ...f, search: e.target.value, page: 1 })}
          />
        </div>
        <select
          className="inp"
          value={f.category}
          onChange={(e) => setF({ ...f, category: e.target.value, page: 1 })}
        >
          <option value="">All categories</option>
          <option>Program</option>
          <option>Event</option>
          <option>Relief</option>
        </select>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            rows={loading ? [] : data?.data}
            empty={loading ? "Loading…" : "No announcements yet"}
            columns={[
              { label: "Title", key: "title", className: "font-semibold" },
              {
                label: "Category",
                render: (a) => <CategoryBadge category={a.category} />,
              },
              { label: "Date", render: (a) => fmtDate(a.date) },
              {
                label: "Beneficiaries",
                render: (a) => Number(a.beneficiaries_count).toLocaleString(),
              },
              {
                label: "Actions",
                render: (a) => (
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/announcements/${a.id}/edit`}
                      className="btn-outline !px-3 !py-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      className="btn-danger !px-3 !py-1.5"
                      onClick={() => setDel(a)}
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
        title="Delete announcement?"
        message={`"${del?.title}" will be removed from the public site.`}
        onClose={() => setDel(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  );
}
