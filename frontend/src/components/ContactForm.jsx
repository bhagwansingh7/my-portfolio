import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import api, { errorMessage, fieldErrors } from '../services/api';
import { Spinner } from './ui';

const LIMITS = { name: [2, 100], subject: [3, 160], message: [10, 3000] };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const empty = { name: '', email: '', subject: '', message: '', website: '' };

const validate = (v) => {
  const e = {};
  const name = v.name.trim(); const subject = v.subject.trim(); const message = v.message.trim();
  if (!name) e.name = 'Enter your name.'; else if (name.length < LIMITS.name[0]) e.name = 'Name must be at least 2 characters.';
  if (!v.email.trim()) e.email = 'Enter your email address.'; else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address, like name@example.com.';
  if (!subject) e.subject = 'Enter a subject.'; else if (subject.length < LIMITS.subject[0]) e.subject = 'Subject must be at least 3 characters.';
  if (!message) e.message = 'Write a message.'; else if (message.length < LIMITS.message[0]) e.message = 'Message must be at least 10 characters.'; else if (message.length > LIMITS.message[1]) e.message = 'Message must be 3000 characters or fewer.';
  return e;
};

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const props = (k) => ({ id: `contact-${k}`, value: values[k], onChange: set(k), 'aria-invalid': errors[k] ? 'true' : undefined, 'aria-describedby': errors[k] ? `contact-${k}-error` : undefined, className: 'input', disabled: status === 'sending' });

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus('sending'); setServerError('');
    try {
      await api.post('/contact', { ...values, name: values.name.trim(), subject: values.subject.trim(), message: values.message.trim(), email: values.email.trim() });
      setStatus('success'); setValues(empty);
    } catch (err) {
      setErrors(fieldErrors(err));
      setServerError(errorMessage(err));
      setStatus('error');
    }
  };

  return (
    <div className="card relative overflow-hidden p-5 sm:p-7">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[22rem] flex-col items-center justify-center text-center" role="status">
            <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
            <h3 className="mt-4 text-xl font-semibold">Message sent</h3>
            <p className="mt-2 max-w-xs text-sm text-muted">Thanks for reaching out. I’ll reply to your email address soon.</p>
            <button type="button" className="btn btn-secondary mt-6" onClick={() => setStatus('idle')}>Send another message</button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="space-y-4" aria-label="Contact form">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="contact-name" label="Name" error={errors.name}><input {...props('name')} type="text" autoComplete="name" maxLength={100} /></Field>
              <Field id="contact-email" label="Email" error={errors.email}><input {...props('email')} type="email" autoComplete="email" maxLength={190} /></Field>
            </div>
            <Field id="contact-subject" label="Subject" error={errors.subject}><input {...props('subject')} type="text" maxLength={160} /></Field>
            <Field id="contact-message" label="Message" error={errors.message}>
              <textarea {...props('message')} rows={6} maxLength={3000} className="input resize-y" />
              <p className="mt-1 text-right text-xs text-muted" aria-hidden="true">{values.message.length} / 3000</p>
            </Field>

            {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field empty</label>
              <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
            </div>

            {status === 'error' && <p className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">{serverError}</p>}

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={status === 'sending'} className="btn btn-primary w-full sm:w-auto">
              {status === 'sending' ? <><Spinner className="h-4 w-4" /> Sending…</> : <><Send className="h-4 w-4" aria-hidden /> Send message</>}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
