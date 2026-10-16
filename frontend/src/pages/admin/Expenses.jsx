import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api, { parseError } from "../../api";
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  Field,
  Modal,
  PageHeader,
} from "../../components/ui";
import { fmtDate, money, toInputDate, useFetch } from "../../utils";

const blank = {
  item_name: "",
  quantity: 1,
  unit_cost: "",
  date_purchased: new Date().toISOString().slice(0, 10),
};

export default function Expenses() {
  const { id } = useParams();
  const project = useFetch(`/admin/projects/${id}`);
  const { data, loading, error, reload } = useFetch(
    `/admin/projects/${id}/expenses`
  );
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const open = (x) => {
    setEditing(x || {});
    setForm(
      x
        ? {
            item_name: x.item_name,
            quantity: x.quantity,
            unit_cost: x.unit_cost,
            date_purchased: toInputDate(x.date_purchased),
          }
        : blank
    );
    setErrors({});
  };
  const total = (Number(form.quantity) || 0) * (Number(form.unit_cost) || 0);
  const over =
    data && project.data && data.total > project.data.amount_allocated;

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      editing.id
        ? await api.put(`/admin/expenses/${editing.id}`, form)
        : await api.post(`/admin/projects/${id}/expenses`, form);
      toast.success("Expense saved");
      setEditing(null);
      reload();
    } catch (err) {
      const p = parseError(err);
      setErrors(p.fields);
      toast.error(p.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/expenses/${del.id}`);
      toast.success("Expense deleted");
      setDel(null);
      reload();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="mb-2 text-sm text-slate-500">
        <Link to="/admin/projects" className="text-green-700 hover:underline">
          Projects
        </Link>{" "}
        / {project.data?.title}
      </p>
      <PageHeader
        title="Expenses"
        subtitle={
          project.data
            ? `Allocated: ${money(project.data.amount_allocated)}`
            : ""
        }
      >
        <button className="btn-primary" onClick={() => open()}>
          <Plus className="h-4 w-4" />
          Add expense
        </button>
      </PageHeader>
      {over && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
        >
          Total expenses ({money(data.total)}) are above this project's
          allocated amount.
        </div>
      )}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable
            rows={loading ? [] : data?.data}
            empty={loading ? "Loading…" : "No expenses logged yet"}
            columns={[
              { label: "Item", key: "item_name", className: "font-semibold" },
              { label: "Qty", key: "quantity" },
              { label: "Unit cost", render: (x) => money(x.unit_cost) },
              { label: "Total cost", render: (x) => money(x.total_cost) },
              { label: "Date", render: (x) => fmtDate(x.date_purchased) },
              {
                label: "Actions",
                render: (x) => (
                  <div className="flex gap-2">
                    <button
                      className="btn-outline !px-3 !py-1.5"
                      onClick={() => open(x)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      className="btn-danger !px-3 !py-1.5"
                      onClick={() => setDel(x)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <p className="mt-4 text-right text-lg font-bold">
            Total: {money(data?.total)}
          </p>
        </>
      )}

      <Modal
        open={!!editing}
        title={editing?.id ? "Edit expense" : "Add expense"}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Item name" error={errors.item_name}>
            <input
              className="inp"
              required
              placeholder="Enter item name"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quantity" error={errors.quantity}>
              <input
                type="number"
                min="1"
                required
                className="inp"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Unit cost (₱)" error={errors.unit_cost}>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="inp"
                value={form.unit_cost}
                onChange={(e) =>
                  setForm({ ...form, unit_cost: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Date purchased" error={errors.date_purchased}>
            <input
              type="date"
              required
              className="inp"
              value={form.date_purchased}
              onChange={(e) =>
                setForm({ ...form, date_purchased: e.target.value })
              }
            />
          </Field>
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">
            Total cost = quantity × unit cost: <strong>{money(total)}</strong>
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save expense
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!del}
        title="Delete expense?"
        message={`Remove "${del?.item_name}" (${money(del?.total_cost)})?`}
        onClose={() => setDel(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  );
}
