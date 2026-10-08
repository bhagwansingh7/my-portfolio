import { useEffect, useState } from 'react';
import api, { errorMessage, fieldErrors } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import { ErrorState, PageSpinner, Spinner } from '../../components/ui';
import { Field, Input } from '../../components/admin/forms';

export default function SettingsAdmin() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwBusy, setPwBusy] = useState(false);

  const load = () => { setLoadError(''); api.get('/settings').then((r) => setSettings({ site_title: '', meta_description: '', availability_text: '', ...r.data })).catch((e) => setLoadError(errorMessage(e))); };
  useEffect(load, []);

  const saveSettings = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({});
    try { await api.put('/settings', settings); toast.success('Settings saved.'); }
    catch (err) { setErrors(fieldErrors(err)); toast.error(errorMessage(err)); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const found = {};
    if (!pw.currentPassword) found.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 10) found.newPassword = 'New password must be at least 10 characters.';
    if (pw.confirm !== pw.newPassword) found.confirm = 'Passwords do not match.';
    setPwErrors(found);
    if (Object.keys(found).length) return;
    setPwBusy(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password updated.');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setPwErrors(fieldErrors(err)); toast.error(errorMessage(err)); }
    finally { setPwBusy(false); }
  };

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!settings) return <PageSpinner />;
  const set = (k) => (e) => setSettings({ ...settings, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Settings" description="Search-engine details and your admin password." />
      <form onSubmit={saveSettings} noValidate className="card space-y-5 p-5">
        <h2 className="font-display text-lg font-semibold">Site &amp; SEO</h2>
        <Field label="Page title" htmlFor="st-title" hint="Shown in browser tabs and search results." error={errors.site_title}><Input id="st-title" value={settings.site_title} onChange={set('site_title')} maxLength={120} /></Field>
        <Field label="Meta description" htmlFor="st-desc" hint="Around 150 characters works best for search results." error={errors.meta_description}><Input as="textarea" rows={3} id="st-desc" value={settings.meta_description} onChange={set('meta_description')} maxLength={300} /></Field>
        <Field label="Availability badge" htmlFor="st-avail" hint="Small status shown above your name. Leave empty to hide it." error={errors.availability_text}><Input id="st-avail" value={settings.availability_text} onChange={set('availability_text')} maxLength={120} /></Field>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4" />} Save settings</button>
      </form>

      <form onSubmit={changePassword} noValidate className="card mt-6 space-y-5 p-5" autoComplete="off">
        <h2 className="font-display text-lg font-semibold">Change password</h2>
        <Field label="Current password" htmlFor="pw-cur" error={pwErrors.currentPassword}><Input id="pw-cur" type="password" autoComplete="current-password" value={pw.currentPassword} error={pwErrors.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password" htmlFor="pw-new" hint="At least 10 characters." error={pwErrors.newPassword}><Input id="pw-new" type="password" autoComplete="new-password" value={pw.newPassword} error={pwErrors.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password" htmlFor="pw-conf" error={pwErrors.confirm}><Input id="pw-conf" type="password" autoComplete="new-password" value={pw.confirm} error={pwErrors.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        <button type="submit" className="btn btn-secondary" disabled={pwBusy}>{pwBusy && <Spinner className="h-4 w-4" />} Update password</button>
      </form>
    </>
  );
}
