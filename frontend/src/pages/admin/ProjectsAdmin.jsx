import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, FileUp, FolderKanban, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import api, { assetUrl, errorMessage, fieldErrors } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { EmptyState, ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { Field, ImageUpload, Input, StringList, TagInput, Toggle, useUpload } from '../../components/admin/forms';

const blank = {
  name: '', short_description: '', description: '', problem: '', solution: '', architecture: '', challenges: '', engineering_decisions: '',
  cover_image: '', github_url: '', live_url: '', featured: false, display_order: 0, year: new Date().getFullYear(),
  features: [], highlights: [], technologies: [], images: [],
};

function Screenshots({ images, onChange }) {
  const input = useRef(null);
  const { upload, progress, uploading } = useUpload();
  const pick = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    const added = [];
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      const url = await upload(f, 'image');
      if (url) added.push({ url, caption: '' });
    }
    if (added.length) onChange([...images, ...added]);
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <div key={img.url + i} className="space-y-1.5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-line">
              <img src={assetUrl(img.url)} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-base/90 text-ink hover:bg-danger hover:text-white" aria-label={`Remove screenshot ${i + 1}`}><X className="h-4 w-4" /></button>
            </div>
            <input className="input !py-1.5 text-xs" placeholder="Caption (optional)" aria-label={`Caption for screenshot ${i + 1}`} value={img.caption || ''} maxLength={200}
              onChange={(e) => onChange(images.map((x, idx) => (idx === i ? { ...x, caption: e.target.value } : x)))} />
          </div>
        ))}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={pick} aria-label="Choose screenshots" />
      <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => input.current?.click()} disabled={uploading}>
        {uploading ? <><Spinner className="h-3.5 w-3.5" /> Uploading… {progress}%</> : <><FileUp className="h-3.5 w-3.5" aria-hidden /> Upload screenshots</>}
      </button>
    </div>
  );
}

export default function ProjectsAdmin() {
  const toast = useToast();
  const [projects, setProjects] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(() => {
    setLoadError('');
    api.get('/projects').then((r) => setProjects(r.data)).catch((e) => setLoadError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const openNew = () => { setErrors({}); setEditing({ ...blank, display_order: (projects?.length || 0) + 1 }); };
  const openEdit = async (p) => {
    setOpening(p.id); setErrors({});
    try {
      const res = await api.get(`/projects/${p.id}`);
      setEditing({ ...blank, ...res.data, images: res.data.images || [] });
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setOpening(null); }
  };

  const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    const text = (v) => v || '';
    const payload = {
      name: editing.name, short_description: editing.short_description, description: text(editing.description), problem: text(editing.problem),
      solution: text(editing.solution), architecture: text(editing.architecture), challenges: text(editing.challenges), engineering_decisions: text(editing.engineering_decisions),
      cover_image: text(editing.cover_image), github_url: text(editing.github_url), live_url: text(editing.live_url), featured: editing.featured,
      display_order: Number(editing.display_order) || 0, year: editing.year === '' || editing.year == null ? null : Number(editing.year),
      features: editing.features.map((f) => f.trim()).filter(Boolean), highlights: editing.highlights.map((f) => f.trim()).filter(Boolean),
      technologies: editing.technologies, images: editing.images.map(({ url, caption }) => ({ url, caption: caption || '' })),
    };
    try {
      if (editing.id) await api.put(`/projects/${editing.id}`, payload); else await api.post('/projects', payload);
      toast.success(editing.id ? 'Project updated.' : 'Project created.');
      setEditing(null); load();
    } catch (err) { setErrors(fieldErrors(err)); toast.error(errorMessage(err)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try { await api.delete(`/projects/${deleting.id}`); toast.success('Project deleted.'); setDeleting(null); load(); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setDeleteBusy(false); }
  };

  const toggleFeatured = async (p) => {
    try {
      const full = (await api.get(`/projects/${p.id}`)).data;
      await api.put(`/projects/${p.id}`, { ...full, featured: !p.featured, images: full.images.map(({ url, caption }) => ({ url, caption: caption || '' })) });
      load();
    } catch (err) { toast.error(errorMessage(err)); }
  };

  const err = (k) => errors[k];

  return (
    <>
      <PageHeader title="Projects" description="Add, edit and reorder your projects. Lower order numbers appear first; a featured project at the top gets a wide card."
        action={<button type="button" className="btn btn-primary" onClick={openNew}><Plus className="h-4 w-4" aria-hidden /> Add project</button>} />

      {loadError ? <ErrorState message={loadError} onRetry={load} /> : !projects ? <PageSpinner /> : projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" text="Add a project to show it on your portfolio." action={<button type="button" className="btn btn-primary" onClick={openNew}>Add project</button>} />
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap sm:p-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-raised">{p.cover_image && <img src={assetUrl(p.cover_image)} alt="" loading="lazy" className="h-full w-full object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-sm text-muted">Order {p.display_order}{p.year ? ` · ${p.year}` : ''} · {p.technologies.length} technologies</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => toggleFeatured(p)} className={`btn btn-ghost btn-sm !px-2 ${p.featured ? '!text-accent' : ''}`} aria-pressed={p.featured} aria-label={`${p.featured ? 'Unfeature' : 'Feature'} ${p.name}`}><Star className={`h-4 w-4 ${p.featured ? 'fill-current' : ''}`} /></button>
                <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm !px-2" aria-label={`View ${p.name} on the site`}><ExternalLink className="h-4 w-4" /></a>
                <button type="button" onClick={() => openEdit(p)} disabled={opening === p.id} className="btn btn-ghost btn-sm !px-2" aria-label={`Edit ${p.name}`}>{opening === p.id ? <Spinner className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}</button>
                <button type="button" onClick={() => setDeleting(p)} className="btn btn-ghost btn-sm !px-2 hover:!text-danger" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} onClose={() => !saving && setEditing(null)} size="lg" title={editing?.id ? `Edit ${editing.name}` : 'New project'}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button type="submit" form="project-form" className="btn btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />} {editing?.id ? 'Save changes' : 'Create project'}</button></>}>
        {editing && (
          <form id="project-form" onSubmit={save} noValidate className="space-y-8">
            <fieldset className="space-y-4">
              <legend className="mb-1 font-display text-base font-semibold">Basics</legend>
              <Field label="Project name" htmlFor="p-name" error={err('name')}><Input id="p-name" value={editing.name} error={err('name')} onChange={set('name')} maxLength={120} /></Field>
              <Field label="Short description" htmlFor="p-short" hint="Shown on the project card." error={err('short_description')}><Input as="textarea" rows={2} id="p-short" value={editing.short_description} error={err('short_description')} onChange={set('short_description')} maxLength={300} /></Field>
              <ImageUpload label="Cover image" value={editing.cover_image} onChange={(v) => setEditing({ ...editing, cover_image: v })} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Year" htmlFor="p-year" error={err('year')}><Input id="p-year" type="number" value={editing.year ?? ''} error={err('year')} onChange={set('year')} /></Field>
                <Field label="Display order" htmlFor="p-order" error={err('display_order')}><Input id="p-order" type="number" min="0" value={editing.display_order} error={err('display_order')} onChange={set('display_order')} /></Field>
                <div><span className="label">Featured</span><div className="flex h-[42px] items-center"><Toggle checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Featured project" /></div></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="GitHub URL" htmlFor="p-gh" error={err('github_url')}><Input id="p-gh" type="url" placeholder="https://github.com/…" value={editing.github_url || ''} error={err('github_url')} onChange={set('github_url')} /></Field>
                <Field label="Live demo URL" htmlFor="p-live" error={err('live_url')}><Input id="p-live" type="url" placeholder="https://…" value={editing.live_url || ''} error={err('live_url')} onChange={set('live_url')} /></Field>
              </div>
              <Field label="Technologies" error={err('technologies') || err('technologies.0')}><TagInput value={editing.technologies} onChange={(v) => setEditing({ ...editing, technologies: v })} /></Field>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="mb-1 font-display text-base font-semibold">Case study</legend>
              {[
                ['description', 'Detailed description', 4], ['problem', 'Problem statement', 3], ['solution', 'Solution', 3],
                ['architecture', 'Architecture', 3], ['challenges', 'Challenges', 3], ['engineering_decisions', 'Engineering decisions', 3],
              ].map(([k, label, rows]) => (
                <Field key={k} label={label} htmlFor={`p-${k}`} error={err(k)}><Input as="textarea" rows={rows} id={`p-${k}`} value={editing[k] || ''} error={err(k)} onChange={set(k)} /></Field>
              ))}
              <Field label="Key features" error={err('features')}><StringList value={editing.features} onChange={(v) => setEditing({ ...editing, features: v })} addLabel="Add feature" /></Field>
              <Field label="Engineering highlights" error={err('highlights')}><StringList value={editing.highlights} onChange={(v) => setEditing({ ...editing, highlights: v })} addLabel="Add highlight" /></Field>
            </fieldset>

            <fieldset>
              <legend className="mb-3 font-display text-base font-semibold">Screenshots</legend>
              <Screenshots images={editing.images} onChange={(v) => setEditing({ ...editing, images: v })} />
            </fieldset>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} busy={deleteBusy} message={`Delete “${deleting?.name}” and all its screenshots? This can’t be undone.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  );
}
