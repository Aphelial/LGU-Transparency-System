import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import api, { parseError, toFormData } from "../../api";
import { BackLink, Card, Field, PageHeader } from "../../components/ui";
import Spinner from "../../components/Spinner";
import { STATUSES, money, toInputDate, useFetch } from "../../utils";

const blank = {
  title: "",
  description: "",
  budget_id: "",
  amount_allocated: "",
  status: "Planned",
  contractor: "",
  location: "",
  progress_notes: "",
  start_date: "",
  target_end_date: "",
  actual_end_date: "",
};

const localDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

function FilePreviewCard({ file, onRemove, label = "New" }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative group overflow-hidden rounded-lg border border-emerald-300 bg-slate-50 shadow-sm">
      {src ? (
        <img
          src={src}
          alt={file.name}
          className="aspect-video w-full rounded-t-lg object-cover"
        />
      ) : (
        <div className="aspect-video grid place-items-center bg-slate-100 text-xs text-slate-400">Loading…</div>
      )}
      <span className="absolute left-1.5 top-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
        {label}
      </span>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        title="Remove"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-red-50 hover:text-red-600 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="p-1.5 text-[11px] font-medium text-slate-600 truncate" title={file.name}>
        {file.name}
      </div>
    </div>
  );
}

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const budgets = useFetch("/admin/budgets", { per_page: 100 });
  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState({ images: [], progress_photos: [] });
  const [existingMedia, setExistingMedia] = useState({
    images: [],
    progress_photos: [],
  });
  const [removedMedia, setRemovedMedia] = useState({
    imageIds: [],
    progressPhotoIds: [],
    legacyImage: false,
    legacyProgressPhoto: false,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const today = localDate();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/admin/projects/${id}`)
      .then(({ data }) => {
        setForm({
          ...blank,
          ...Object.fromEntries(
            Object.keys(blank).map((k) => [k, data[k] ?? ""])
          ),
          start_date: toInputDate(data.start_date),
          target_end_date: toInputDate(data.target_end_date),
          actual_end_date: toInputDate(data.actual_end_date),
        });
        const media = data.media || [];
        const savedImages = media
          .filter((item) => item.type === "image")
          .map((item) => ({ id: item.id, path: item.path, url: item.url }));
        const savedProgressPhotos = media
          .filter((item) => item.type === "progress_photo")
          .map((item) => ({ id: item.id, path: item.path, url: item.url }));
        if (
          data.image_path &&
          !savedImages.some((item) => item.path === data.image_path)
        ) {
          savedImages.unshift({
            path: data.image_path,
            url: data.image_urls?.[0],
            legacy: true,
          });
        }
        if (
          data.progress_photo_path &&
          !savedProgressPhotos.some(
            (item) => item.path === data.progress_photo_path
          )
        ) {
          savedProgressPhotos.unshift({
            path: data.progress_photo_path,
            url: data.progress_photo_urls?.[0],
            legacy: true,
          });
        }
        setExistingMedia({
          images: savedImages,
          progress_photos: savedProgressPhotos,
        });
      })
      .catch(() => navigate("/admin/projects"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setFilesFor = (key) => (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((current) => ({
      ...current,
      [key]: [
        ...current[key],
        ...selected.filter(
          (file) =>
            !current[key].some(
              (existing) =>
                existing.name === file.name &&
                existing.size === file.size &&
                existing.lastModified === file.lastModified
            )
        ),
      ],
    }));
    e.target.value = "";
  };
  const visibleMedia = (key) =>
    existingMedia[key].filter((item) => {
      if (item.legacy)
        return !(key === "images"
          ? removedMedia.legacyImage
          : removedMedia.legacyProgressPhoto);
      return !(
        key === "images" ? removedMedia.imageIds : removedMedia.progressPhotoIds
      ).includes(item.id);
    });
  const removeSavedMedia = (key, item) => {
    if (item.legacy) {
      setRemovedMedia((current) => ({
        ...current,
        [key === "images" ? "legacyImage" : "legacyProgressPhoto"]: true,
      }));
      return;
    }
    const field = key === "images" ? "imageIds" : "progressPhotoIds";
    setRemovedMedia((current) => ({
      ...current,
      [field]: [...current[field], item.id],
    }));
  };
  const removeSelectedFile = (key, index) =>
    setFiles((current) => ({
      ...current,
      [key]: current[key].filter((_, fileIndex) => fileIndex !== index),
    }));
  const budget = budgets.data?.data.find(
    (b) => String(b.id) === String(form.budget_id)
  );
  const imageError =
    errors.images ||
    Object.entries(errors).find(([key]) => key.startsWith("images."))?.[1];
  const progressPhotoError =
    errors.progress_photos ||
    Object.entries(errors).find(([key]) =>
      key.startsWith("progress_photos.")
    )?.[1];

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const fd = toFormData(form);
      files.images.forEach((file) => fd.append("images[]", file));
      files.progress_photos.forEach((file) =>
        fd.append("progress_photos[]", file)
      );
      removedMedia.imageIds.forEach((mediaId) =>
        fd.append("remove_image_ids[]", mediaId)
      );
      removedMedia.progressPhotoIds.forEach((mediaId) =>
        fd.append("remove_progress_photo_ids[]", mediaId)
      );
      if (removedMedia.legacyImage) fd.append("remove_legacy_image", "1");
      if (removedMedia.legacyProgressPhoto)
        fd.append("remove_legacy_progress_photo", "1");
      if (id) {
        fd.append("_method", "PUT");
        await api.post(`/admin/projects/${id}`, fd);
      } else await api.post("/admin/projects", fd);
      toast.success("Project saved");
      navigate("/admin/projects");
    } catch (err) {
      const p = parseError(err);
      setErrors(p.fields);
      toast.error(p.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    );

  return (
    <>
      <BackLink to="/admin/projects">Back to projects</BackLink>
      <PageHeader title={id ? "Edit project" : "Add project"} />
      <form onSubmit={submit}>
        <Card className="grid gap-4 p-6 md:grid-cols-6">
          <Field className="md:col-span-4" label="Title" error={errors.title}>
            <input
              className="inp"
              required
              placeholder="Enter title"
              value={form.title}
              onChange={set("title")}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Category (from linked budget)"
          >
            <input
              className="inp bg-slate-50"
              readOnly
              value={budget?.category || "Select a linked budget"}
            />
          </Field>
          <Field
            className="md:col-span-6"
            label="Description"
            error={errors.description}
          >
            <textarea
              rows={3}
              required
              className="inp"
              value={form.description}
              onChange={set("description")}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Linked budget"
            error={errors.budget_id}
          >
            <select
              className="inp"
              required
              value={form.budget_id}
              onChange={set("budget_id")}
            >
              <option value="">Select budget</option>
              {budgets.data?.data.map((b) => (
                <option key={b.id} value={b.id}>
                  FY {b.fiscal_year} – {b.category} ({money(b.amount_allocated)}
                  )
                </option>
              ))}
            </select>
          </Field>
          <Field
            className="md:col-span-2"
            label="Amount allocated (₱)"
            error={errors.amount_allocated}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="inp"
              value={form.amount_allocated}
              onChange={set("amount_allocated")}
            />
          </Field>
          <Field className="md:col-span-2" label="Status" error={errors.status}>
            <select
              className="inp"
              required
              value={form.status}
              onChange={set("status")}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field
            className="md:col-span-3"
            label="Contractor"
            error={errors.contractor}
          >
            <input
              required
              className="inp"
              placeholder="Enter contractor"
              value={form.contractor}
              onChange={set("contractor")}
            />
          </Field>
          <Field
            className="md:col-span-3"
            label="Location"
            error={errors.location}
          >
            <input
              required
              className="inp"
              placeholder="Enter location"
              value={form.location}
              onChange={set("location")}
            />
          </Field>
          <Field
            className="md:col-span-6"
            label="Progress notes (optional, shown publicly)"
            error={errors.progress_notes}
          >
            <textarea
              rows={3}
              className="inp"
              placeholder="Enter the latest project progress update"
              value={form.progress_notes}
              onChange={set("progress_notes")}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Start date"
            error={errors.start_date}
          >
            <input
              type="date"
              min={today}
              required
              className="inp"
              value={form.start_date}
              onChange={set("start_date")}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Target end date"
            error={errors.target_end_date}
          >
            <input
              type="date"
              min={form.start_date || today}
              required
              className="inp"
              value={form.target_end_date}
              onChange={set("target_end_date")}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label={`Actual end date${
              form.status === "Completed" ? " (required)" : ""
            }`}
            error={errors.actual_end_date}
          >
            <input
              type="date"
              min={form.start_date || today}
              required={form.status === "Completed"}
              className="inp"
              value={form.actual_end_date}
              onChange={set("actual_end_date")}
            />
          </Field>
          <Field
            className="md:col-span-3"
            label="Project images"
            error={imageError}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              required={!visibleMedia("images").length && !files.images.length}
              className="inp"
              onChange={setFilesFor("images")}
            />
            {(visibleMedia("images").length > 0 || files.images.length > 0) && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleMedia("images").map((item) => (
                  <div key={item.id || item.path} className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
                    <img
                      src={item.url}
                      alt="Saved project"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-slate-700/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
                      Saved
                    </span>
                    <button
                      type="button"
                      aria-label="Remove saved project image"
                      title="Remove image when saved"
                      onClick={() => removeSavedMedia("images", item)}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {files.images.map((file, index) => (
                  <FilePreviewCard
                    key={`${file.name}-${file.lastModified}-${index}`}
                    file={file}
                    onRemove={() => removeSelectedFile("images", index)}
                    label="New"
                  />
                ))}
              </div>
            )}
          </Field>
          <Field
            className="md:col-span-3"
            label="Progress photos"
            error={progressPhotoError}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="inp"
              onChange={setFilesFor("progress_photos")}
            />
            {(visibleMedia("progress_photos").length > 0 || files.progress_photos.length > 0) && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {visibleMedia("progress_photos").map((item) => (
                  <div key={item.id || item.path} className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
                    <img
                      src={item.url}
                      alt="Saved progress"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded bg-slate-700/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
                      Saved
                    </span>
                    <button
                      type="button"
                      aria-label="Remove saved progress photo"
                      title="Remove photo when saved"
                      onClick={() => removeSavedMedia("progress_photos", item)}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {files.progress_photos.map((file, index) => (
                  <FilePreviewCard
                    key={`${file.name}-${file.lastModified}-${index}`}
                    file={file}
                    onRemove={() => removeSelectedFile("progress_photos", index)}
                    label="New"
                  />
                ))}
              </div>
            )}
          </Field>
          <div className="flex gap-2 md:col-span-6">
            <button className="btn-primary" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Save project
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate("/admin/projects")}
            >
              Cancel
            </button>
          </div>
        </Card>
      </form>
    </>
  );
}
