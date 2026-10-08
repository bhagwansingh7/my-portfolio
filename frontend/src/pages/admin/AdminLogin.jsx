import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, fieldErrors } from '../../services/api';
import { Spinner } from '../../components/ui';
import useSeo from '../../hooks/useSeo';
import { Field, Input } from '../../components/admin/forms';

export default function AdminLogin() {
  const { user, loading, login } = useAuth();
  useSeo({ title: 'Admin sign in', description: 'Admin area' });
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.email.trim()) found.email = 'Enter your email address.';
    if (!form.password) found.password = 'Enter your password.';
    setErrors(found); setError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from?.startsWith('/admin') ? location.state.from : '/admin/dashboard', { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card w-full max-w-sm p-6 sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-raised"><Lock className="h-5 w-5 text-accent" aria-hidden /></div>
        <h1 className="mt-5 text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Manage your portfolio content.</p>
        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field label="Email" htmlFor="login-email" error={errors.email}>
            <Input id="login-email" type="email" autoComplete="username" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoFocus />
          </Field>
          <Field label="Password" htmlFor="login-password" error={errors.password}>
            <Input id="login-password" type="password" autoComplete="current-password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {error && <p className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy && <Spinner className="h-4 w-4" />} Sign in</button>
        </form>
      </motion.div>
    </div>
  );
}
