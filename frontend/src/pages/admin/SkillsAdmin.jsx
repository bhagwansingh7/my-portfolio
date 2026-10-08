import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { EmptyState, ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { Field, Input, Toggle } from '../../components/admin/forms';
import { SkillIcon, skillIcons } from '../../components/icons';

const blank = { name: '', category: '', icon: 'Code2', level: null, enabled: true };

export default function SkillsAdmin() {
  const toast = useToast();
  const [skills, setSkills] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null); // skill object (id optional) or null
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [dragId, setDragId] = useState(null);

  const load = useCallback(() => {
    setLoadError('');
    api.get('/skills', { params: { all: 1 } }).then((r) => setSkills(r.data)).catch((e) => setLoadError(errorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const categories = useMemo(() => [...new Set((skills || []).map((s) => s.category))], [skills]);

  const persistOrder = async (next) => {
    const previous = skills;
    setSkills(next);
    try { await api.put('/skills/reorder', { ids: next.map((s) => s.id) }); }
    catch (err) { setSkills(previous); toast.error(errorMessage(err, 'Could not save the new order.')); }
  };
  const move = (from, to) => {
    if (to < 0 || to >= skills.length || from === to) return;
    const next = [...skills];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };
  const onDrop = (overId) => {
    if (dragId == null || dragId === overId) return;
    move(skills.findIndex((s) => s.id === dragId), skills.findIndex((s) => s.id === overId));
    setDragId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    const payload = { name: editing.name, category: editing.category, icon: editing.icon, level: editing.level, enabled: editing.enabled };
    try {
      if (editing.id) await api.put(`/skills/${editing.id}`, payload); else await api.post('/skills', payload);
      toast.success(editing.id ? 'Skill updated.' : 'Skill added.');
      setEditing(null); load();
    } catch (err) { setErrors(fieldErrors(err)); toast.error(errorMessage(err)); }
    finally { setSaving(false); }
  };

  const toggleEnabled = async (s) => {
    setSkills(skills.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)));
    try { await api.put(`/skills/${s.id}`, { ...s, enabled: !s.enabled }); }
    catch (err) { load(); toast.error(errorMessage(err)); }
  };

  const confirmDelete = async () => {
    try { await api.delete(`/skills/${deleting.id}`); toast.success('Skill deleted.'); setDeleting(null); load(); }
    catch (err) { toast.error(errorMessage(err)); setDeleting(null); }
  };

  return (
    <>
      <PageHeader title="Skills" description="Drag rows (or use the arrows) to set the order. Skills are grouped by category on the public site."
        action={<button type="button" className="btn btn-primary" onClick={() => { setErrors({}); setEditing({ ...blank, category: categories[0] || '' }); }}><Plus className="h-4 w-4" aria-hidden /> Add skill</button>} />

      {loadError ? <ErrorState message={loadError} onRetry={load} /> : !skills ? <PageSpinner /> : skills.length === 0 ? (
        <EmptyState icon={Sparkles} title="No skills yet" text="Add your first skill to show it on the home page." />
      ) : (
        <ul className="card divide-y divide-line">
          {skills.map((s, i) => (
            <li key={s.id} draggable onDragStart={() => setDragId(s.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(s.id)} onDragEnd={() => setDragId(null)}
                className={`flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 ${dragId === s.id ? 'opacity-40' : ''} ${s.enabled ? '' : 'bg-raised/40'}`}>
              <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-muted sm:block" aria-hidden />
              <SkillIcon name={s.icon} className="h-[18px] w-[18px] shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${s.enabled ? '' : 'text-muted line-through'}`}>{s.name}</p>
                <p className="truncate text-xs text-muted">{s.category}{s.level != null ? ` · ${s.level}%` : ''}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${s.name} up`}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => move(i, i + 1)} disabled={i === skills.length - 1} aria-label={`Move ${s.name} down`}><ArrowDown className="h-4 w-4" /></button>
              </div>
              <Toggle checked={s.enabled} onChange={() => toggleEnabled(s)} label={`${s.enabled ? 'Disable' : 'Enable'} ${s.name}`} />
              <button type="button" className="btn btn-ghost btn-sm !px-2" onClick={() => { setErrors({}); setEditing({ ...s }); }} aria-label={`Edit ${s.name}`}><Pencil className="h-4 w-4" /></button>
              <button type="button" className="btn btn-ghost btn-sm !px-2 hover:!text-danger" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} onClose={() => !saving && setEditing(null)} title={editing?.id ? 'Edit skill' : 'Add skill'}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button><button type="submit" form="skill-form" className="btn btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />} {editing?.id ? 'Save changes' : 'Add skill'}</button></>}>
        {editing && (
          <form id="skill-form" onSubmit={save} noValidate className="space-y-4">
            <Field label="Name" htmlFor="s-name" error={errors.name}><Input id="s-name" value={editing.name} error={errors.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={80} /></Field>
            <Field label="Category" htmlFor="s-cat" hint="Pick an existing category or type a new one." error={errors.category}>
              <Input id="s-cat" list="skill-categories" value={editing.category} error={errors.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} maxLength={80} />
              <datalist id="skill-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <fieldset>
              <legend className="label">Icon</legend>
              <div className="grid max-h-44 grid-cols-6 gap-1.5 overflow-y-auto rounded-md border border-line p-2 sm:grid-cols-8">
                {Object.keys(skillIcons).map((name) => (
                  <button key={name} type="button" onClick={() => setEditing({ ...editing, icon: name })} title={name} aria-label={name} aria-pressed={editing.icon === name}
                    className={`flex h-10 items-center justify-center rounded-md border transition-colors ${editing.icon === name ? 'border-accent bg-accent/10 text-accent' : 'border-transparent text-muted hover:bg-raised hover:text-ink'}`}>
                    <SkillIcon name={name} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <div className="flex items-center justify-between"><span className="label !mb-0">Proficiency</span>
                <Toggle checked={editing.level != null} onChange={(on) => setEditing({ ...editing, level: on ? 70 : null })} label="Show proficiency bar" /></div>
              {editing.level != null && (
                <div className="mt-3 flex items-center gap-3">
                  <input type="range" min="0" max="100" step="5" value={editing.level} onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })} className="flex-1 accent-[rgb(var(--accent))]" aria-label="Proficiency percent" />
                  <span className="w-10 text-right text-sm tabular-nums">{editing.level}%</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between"><span className="label !mb-0">Visible on public site</span><Toggle checked={editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} label="Visible on public site" /></div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} message={`Delete “${deleting?.name}”? This can’t be undone.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  );
}
