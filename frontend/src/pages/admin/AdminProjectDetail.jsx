import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, X, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { parseError } from '../../api';
import { BackLink, Card, ChartCard, ConfirmDialog, DataTable, ErrorState, PageHeader, PageSkeleton, StatusBadge, UtilBar } from '../../components/ui';
import { fmtDate, money, useFetch } from '../../utils';

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-right font-semibold text-gov-navy">{value || '—'}</dd>
  </div>
);

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, loading, error, reload } = useFetch(`/admin/projects/${id}`);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activePhoto, setActivePhoto] = useState(null);
  const [busy, setBusy] = useState(false);

  const removeProject = async () => {
    setBusy(true);
    try {
      await api.delete(`/admin/projects/${id}`);
      toast.success('Project deleted');
      navigate('/admin/projects');
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!project) return null;

  const spent = Number(project.spent || 0);
  const percentSpent = project.amount_allocated ? spent / project.amount_allocated * 100 : 0;
  const projectImages = project.image_urls || [];
  const progressPhotos = project.progress_photo_urls || [];

  return (
    <>
      <BackLink to="/admin">Back to dashboard</BackLink>
      <PageHeader title={project.title} subtitle="Complete project information">
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/projects/${project.id}/edit`} className="btn-outline"><Pencil className="h-4 w-4" />Edit project</Link>
          <button type="button" className="btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" />Delete project</button>
        </div>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="text-sm text-slate-500">Project #{String(project.id).padStart(4, '0')}</span>
        </div>
        <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-gov-forest hover:underline"><ArrowLeft className="h-4 w-4" />All projects</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Project description">
            <p className="leading-relaxed text-slate-700">{project.description || 'No description provided.'}</p>
            {projectImages.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {projectImages.map((url, index) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => setActivePhoto({ url, title: `${project.title} – Photo ${index + 1}` })}
                    className="group relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-gov-forest transition"
                  >
                    <img src={url} alt={`${project.title} project ${index + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-6 w-6 text-white drop-shadow" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Progress update">
            <p className="leading-relaxed text-slate-700">{project.progress_notes || 'No progress notes yet.'}</p>
            {progressPhotos.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {progressPhotos.map((url, index) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => setActivePhoto({ url, title: `${project.title} – Progress Update ${index + 1}` })}
                    className="group relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 hover:ring-2 hover:ring-gov-forest transition"
                  >
                    <img src={url} alt={`${project.title} progress ${index + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-6 w-6 text-white drop-shadow" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Expenses">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-slate-500">Budget utilization</span>
              <span className="font-semibold">{money(spent)} of {money(project.amount_allocated)}</span>
            </div>
            <div className="mb-5"><UtilBar value={percentSpent} /></div>
            <DataTable rows={project.expenses} empty="No expenses recorded yet" columns={[
              { label: 'Item', key: 'item_name', className: 'font-semibold text-gov-navy' },
              { label: 'Qty', key: 'quantity' },
              { label: 'Unit cost', render: (expense) => money(expense.unit_cost) },
              { label: 'Total cost', render: (expense) => money(expense.total_cost) },
              { label: 'Date purchased', render: (expense) => fmtDate(expense.date_purchased) },
            ]} />
          </ChartCard>
        </div>

        <Card className="h-fit overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5"><h2 className="text-sm font-bold uppercase tracking-wide text-gov-forest">Project information</h2></div>
          <dl className="px-5 py-2">
            <DetailRow label="Category" value={project.category} />
            <DetailRow label="Linked budget" value={`FY ${project.budget?.fiscal_year} – ${project.budget?.category}`} />
            <DetailRow label="Budget allocated" value={money(project.amount_allocated)} />
            <DetailRow label="Contractor" value={project.contractor} />
            <DetailRow label="Location" value={project.location} />
            <DetailRow label="Start date" value={fmtDate(project.start_date)} />
            <DetailRow label="Target end date" value={fmtDate(project.target_end_date)} />
            <DetailRow label="Actual end date" value={fmtDate(project.actual_end_date)} />
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        message={`"${project.title}" and all of its expenses and photos will be permanently deleted.`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={removeProject}
        busy={busy}
      />

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close image preview"
              onClick={() => setActivePhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white shadow-md hover:bg-black/80 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
            {activePhoto.title && (
              <div className="bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-200">
                {activePhoto.title}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
