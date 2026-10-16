import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { parseError } from "../../api";
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Pagination,
} from "../../components/ui";
import { money, useDebounce, useFetch } from "../../utils";

const blank = {
  fiscal_year: new Date().getFullYear(),
  category: "",
  amount_allocated: "",
};

export default function AdminBudgets() {
  const [params, setParams] = useSearchParams();
  const [f, setF] = useState({ search: "", fiscal_year: "", page: 1 });
  const search = useDebounce(f.search);
  const { data, loading, error, reload } = useFetch("/admin/budgets", {
    ...f,
    search,
  });
  const [editing, setEditing] = useState(null); // null | {} | budget
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const open = (b) => {
    setEditing(b || {});
    setForm(
      b
        ? {
            fiscal_year: b.fiscal_year,
            category: b.category,
            amount_allocated: b.amount_allocated,
          }
        : blank
    );
    setErrors({});
  };
  useEffect(() => {
    if (params.get("new")) {
      open();
      setParams({});
    }
  }, []); // eslint-disable-line

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      editing.id
        ? await api.put(`/admin/budgets/${editing.id}`, form)
        : await api.post("/admin/budgets", form);
      toast.success(editing.id ? "Budget updated" : "Budget added");
      setEditing(null);
      reload();
    } catch (err) {
      const p = parseError(err);
      setErrors(p.fields);
      if (!Object.keys(p.fields).length) toast.error(p.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/budgets/${del.id}`);
      toast.success("Budget deleted");
      setDel(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
      setDel(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Budgets" subtitle="Yearly allocations per category.">
        <button className="btn-primary" onClick={() => open()}>
          <Plus className="h-4 w-4" />
          Add budget
        </button>
      </PageHeader>
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="inp pl-9"
            placeholder="Search budgets"
            value={f.search}
            onChange={(e) => setF({ ...f, search: e.target.value, page: 1 })}
          />
        </div>
        <input
          className="inp"
          type="number"
          placeholder="Fiscal year"
          value={f.fiscal_year}
          onChange={(e) => setF({ ...f, fiscal_year: e.target.value, page: 1 })}
        />
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            rows={loading ? [] : data?.data}
            empty={loading ? "Loading…" : "No budgets yet"}
            columns={[
              { label: "ID", key: "id" },
              { label: "Fiscal year", key: "fiscal_year" },
              {
                label: "Category",
                key: "category",
                className: "font-semibold",
              },
              {
                label: "Amount allocated",
                render: (b) => money(b.amount_allocated),
              },
              { label: "Disbursed", render: (b) => money(b.disbursed) },
              {
                label: "Actions",
                render: (b) => (
                  <div className="flex gap-2">
                    <button
                      className="btn-outline !px-3 !py-1.5"
                      onClick={() => open(b)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      className="btn-danger !px-3 !py-1.5"
                      onClick={() => setDel(b)}
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

      <Modal
        open={!!editing}
        title={editing?.id ? "Edit budget" : "Add budget"}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Fiscal year" error={errors.fiscal_year}>
            <input
              type="number"
              className="inp"
              required
              value={form.fiscal_year}
              onChange={(e) =>
                setForm({ ...form, fiscal_year: e.target.value })
              }
            />
          </Field>
          <Field label="Category" error={errors.category}>
            <input
              className="inp"
              required
              placeholder="e.g. Infrastructure"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Amount allocated (₱)" error={errors.amount_allocated}>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="inp"
              value={form.amount_allocated}
              onChange={(e) =>
                setForm({ ...form, amount_allocated: e.target.value })
              }
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save budget
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!del}
        title="Delete budget?"
        message={`Delete the ${del?.fiscal_year} ${del?.category} budget? This cannot be undone.`}
        onClose={() => setDel(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  );
}
