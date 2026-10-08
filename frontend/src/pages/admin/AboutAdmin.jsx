import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import { ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { Field, ImageUpload, Input, StringList } from '../../components/admin/forms';

const blankEdu = { degree: '', institution: '', period: '', details: '' };

export default function AboutAdmin() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoadError('');
    api.get('/portfolio').then((r) => setForm(r.data)).catch((e) => setLoadError(errorMessage(e)));
  };
  useEffect(load, []);

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!form) return <PageSpinner />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setEdu = (i, k, v) => setForm({ ...form, education: form.education.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    const payload = {
      name: form.name, headline: form.headline, intro: form.intro || '', bio: form.bio || '', profile_image: form.profile_image || '',
      public_email: form.public_email || '', location: form.location || '', developer_focus: form.developer_focus || '', current_focus: form.current_focus || '',
      education: form.education.filter((x) => x.degree.trim() || x.institution.trim()),
      achievements: form.achievements.map((a) => a.trim()).filter(Boolean),
    };
    try {
      const res = await api.put('/portfolio', payload);
      setForm(res.data);
      toast.success('About saved. The public site is updated.');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title="About" description="Your name, headline, photo and story. Everything here is shown on the public home page."
        action={<button type="submit" className="btn btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />} Save changes</button>} />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="card p-4"><ImageUpload label="Profile picture" value={form.profile_image} onChange={(v) => setForm({ ...form, profile_image: v })} aspect="aspect-[4/5]" /></div>

        <div className="card space-y-5 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="a-name" error={errors.name}><Input id="a-name" value={form.name} error={errors.name} onChange={set('name')} maxLength={120} /></Field>
            <Field label="Location" htmlFor="a-loc" error={errors.location}><Input id="a-loc" value={form.location || ''} onChange={set('location')} maxLength={120} /></Field>
          </div>
          <Field label="Headline" htmlFor="a-head" error={errors.headline}><Input id="a-head" value={form.headline} error={errors.headline} onChange={set('headline')} maxLength={240} /></Field>
          <Field label="Short introduction" htmlFor="a-intro" hint="Shown under the headline in the hero." error={errors.intro}><Input as="textarea" rows={3} id="a-intro" value={form.intro || ''} onChange={set('intro')} maxLength={600} /></Field>
          <Field label="Public email" htmlFor="a-mail" error={errors.public_email}><Input id="a-mail" type="email" value={form.public_email || ''} error={errors.public_email} onChange={set('public_email')} /></Field>
          <Field label="Bio" htmlFor="a-bio" hint="Separate paragraphs with a blank line. Plain text only." error={errors.bio}><Input as="textarea" rows={9} id="a-bio" value={form.bio || ''} onChange={set('bio')} maxLength={5000} /></Field>
          <Field label="Developer focus" htmlFor="a-focus" error={errors.developer_focus}><Input as="textarea" rows={3} id="a-focus" value={form.developer_focus || ''} onChange={set('developer_focus')} maxLength={2000} /></Field>
          <Field label="Currently learning / focused on" htmlFor="a-cur" error={errors.current_focus}><Input as="textarea" rows={2} id="a-cur" value={form.current_focus || ''} onChange={set('current_focus')} maxLength={500} /></Field>
        </div>
      </div>

      <section className="card mt-6 p-5" aria-labelledby="edu-h">
        <h2 id="edu-h" className="font-display text-lg font-semibold">Education</h2>
        <div className="mt-4 space-y-4">
          {form.education.map((ed, i) => (
            <div key={i} className="rounded-md border border-line p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input aria-label="Degree" placeholder="Degree or title" value={ed.degree} onChange={(e) => setEdu(i, 'degree', e.target.value)} />
                <Input aria-label="Institution" placeholder="Institution" value={ed.institution} onChange={(e) => setEdu(i, 'institution', e.target.value)} />
                <Input aria-label="Period" placeholder="Period, e.g. 2022 – 2026" value={ed.period || ''} onChange={(e) => setEdu(i, 'period', e.target.value)} />
                <Input aria-label="Details" placeholder="Details (optional)" value={ed.details || ''} onChange={(e) => setEdu(i, 'details', e.target.value)} />
              </div>
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => setForm({ ...form, education: form.education.filter((_, idx) => idx !== i) })}><Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove entry</button>
            </div>
          ))}
          {errors['education'] && <p className="text-sm text-danger" role="alert">{errors.education}</p>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm({ ...form, education: [...form.education, { ...blankEdu }] })}><Plus className="h-3.5 w-3.5" aria-hidden /> Add education</button>
        </div>
      </section>

      <section className="card mt-6 p-5" aria-labelledby="ach-h">
        <h2 id="ach-h" className="font-display text-lg font-semibold">Achievements</h2>
        <div className="mt-4"><StringList value={form.achievements} onChange={(v) => setForm({ ...form, achievements: v })} placeholder="e.g. Won a university hackathon" addLabel="Add achievement" max={15} /></div>
      </section>
    </form>
  );
}
