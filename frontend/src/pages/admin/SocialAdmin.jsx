import { useCallback, useEffect, useState } from 'react';
import { Link2, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { EmptyState, ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { Field, Input, Toggle } from '../../components/admin/forms';
import { SocialIcon, socialPlatforms } from '../../components/icons';

const blank = { platform: 'github', label: '', url: '', enabled: true };

export default function SocialAdmin() {
  const toast = useToast();
  const [links, setLinks] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoadError('');
    api.get('/social-links', { params: { all: 1 } }).then((r) => setLinks(r.data)).catch((e) => setLoadError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    const payload = { platform: editing.platform, label: editing.label, url: editing.url, enabled: editing.enabled, display_order: editing.display_order };
    try {
      if (editing.id) await api.put(`/social-links/${editing.id}`, payload); else await api.post('/social-links', payload);
      toast.success('Link saved.'); setEditing(null); load();
    } catch (err) { setErrors(fieldErrors(err)); toast.error(errorMessage(err)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try { await api.delete(`/social-links/${deleting.id}`); toast.success('Link deleted.'); setDeleting(null); load(); }
    catch (err) { toast.error(errorMessage(err)); setDeleting(null); }
  };

  return (
    <>
      <PageHeader title="Social links" description="Shown in the hero, the contact section and the footer. Use mailto:you@example.com for an email link."
        action={<button type="button" className="btn btn-primary" onClick={() => { setErrors({}); setEditing({ ...blank }); }}><Plus className="h-4 w-4" aria-hidden /> Add link</button>} />

      {loadError ? <ErrorState message={loadError} onRetry={load} /> : !links ? <PageSpinner /> : links.length === 0 ? (
        <EmptyState icon={Link2} title="No links yet" text="Add your GitHub, LinkedIn or email." />
      ) : (
        <ul className="card divide-y divide-line">
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-3">
              <SocialIcon platform={l.platform} className="h-5 w-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{l.label}{!l.enabled && <span className="ml-2 text-xs text-muted">(hidden)</span>}</p><p className="truncate text-xs text-muted">{l.url}</p></div>
              <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => { setErrors({}); setEditing({ ...l }); }} aria-label={`Edit ${l.label}`}><Pencil className="h-4 w-4" /></button>
              <button type="button" className="btn btn-ghost btn-sm !px-2 hover:!text-danger" onClick={() => setDeleting(l)} aria-label={`Delete ${l.label}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} onClose={() => !saving && setEditing(null)} title={editing?.id ? 'Edit link' : 'Add link'}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button type="submit" form="social-form" className="btn btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />} Save link</button></>}>
        {editing && (
          <form id="social-form" onSubmit={save} noValidate className="space-y-4">
            <Field label="Platform" htmlFor="l-plat" error={errors.platform}>
              <Input as="select" id="l-plat" value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value })}>
                {socialPlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </Input>
            </Field>
            <Field label="Label" htmlFor="l-label" error={errors.label}><Input id="l-label" value={editing.label} error={errors.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} maxLength={80} /></Field>
            <Field label="URL" htmlFor="l-url" error={errors.url}><Input id="l-url" value={editing.url} error={errors.url} placeholder="https://… or mailto:…" onChange={(e) => setEditing({ ...editing, url: e.target.value })} /></Field>
            <div className="flex items-center justify-between"><span className="label !mb-0">Visible on public site</span><Toggle checked={editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} label="Visible on public site" /></div>
          </form>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} message={`Delete the ${deleting?.label} link?`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  );
}
