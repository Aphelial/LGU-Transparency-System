import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { parseError, toFormData } from '../../api';
import { BackLink, Card, Field, PageHeader } from '../../components/ui';
import Spinner from '../../components/Spinner';
import { toInputDate } from '../../utils';
 
const blank = { title: '', description: '', category: 'Program', date: new Date().toISOString().slice(0, 10), beneficiaries_count: 0, venue: '' };
 
export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [banner, setBanner] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!id);
 
  useEffect(() => {
    if (!id) return;
    api.get(`/admin/announcements/${id}`).then(({ data }) => setForm({ ...blank, ...Object.fromEntries(Object.keys(blank).map((k) => [k, data[k] ?? ''])), date: toInputDate(data.date) }))
      .catch(() => navigate('/admin/announcements')).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line
 
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
 
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErrors({});
    try {
      const fd = toFormData({ ...form, banner });
      if (id) { fd.append('_method', 'PUT'); await api.post(`/admin/announcements/${id}`, fd); } else await api.post('/admin/announcements', fd);
      toast.success('Announcement saved'); navigate('/admin/announcements');
    } catch (err) { const p = parseError(err); setErrors(p.fields); toast.error(p.message); } finally { setBusy(false); }
  };
 
  if (loading) return <div className="grid place-items-center py-20"><Spinner /></div>;
 
  return (
    <>
      <BackLink to="/admin/announcements">Back to announcements</BackLink>
      <PageHeader title={id ? 'Edit announcement' : 'Post announcement'} />
      <form onSubmit={submit}>
        <Card className="grid gap-4 p-6 md:grid-cols-3">
          <Field className="md:col-span-3" label="Title" error={errors.title}><input className="inp" required placeholder="Enter title" value={form.title} onChange={set('title')} /></Field>
          <Field className="md:col-span-3" label="Description" error={errors.description}><textarea rows={5} required className="inp" value={form.description} onChange={set('description')} /></Field>
          <Field label="Category" error={errors.category}><select className="inp" value={form.category} onChange={set('category')}><option>Program</option><option>Event</option><option>Relief</option></select></Field>
          <Field label="Date" error={errors.date}><input type="date" required className="inp" value={form.date} onChange={set('date')} /></Field>
          <Field label="Beneficiaries count" error={errors.beneficiaries_count}><input type="number" min="0" className="inp" value={form.beneficiaries_count} onChange={set('beneficiaries_count')} /></Field>
          <Field className="md:col-span-2" label="Venue" error={errors.venue}><input className="inp" placeholder="e.g. Municipal covered court" value={form.venue} onChange={set('venue')} /></Field>
          <Field label="Banner image" error={errors.banner}><input type="file" accept="image/*" className="inp" onChange={(e) => setBanner(e.target.files[0])} /></Field>
          <div className="flex gap-2 md:col-span-3">
            <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Save announcement</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/admin/announcements')}>Cancel</button>
          </div>
        </Card>
      </form>
    </>
  );
}
