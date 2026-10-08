import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Archive, ChevronDown, Inbox, Mail, MailOpen, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api, { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { EmptyState, ErrorState, PageSpinner } from '../../components/ui';

const TABS = [['', 'All'], ['unread', 'Unread'], ['read', 'Read'], ['archived', 'Archived']];
const BADGE = { unread: 'bg-accent/15 text-accent', read: 'bg-raised text-muted', archived: 'bg-raised text-muted' };

export default function MessagesAdmin() {
  const toast = useToast();
  const { refreshStats } = useOutletContext();
  const [tab, setTab] = useState('');
  const [messages, setMessages] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoadError('');
    api.get('/messages', { params: tab ? { status: tab } : {} }).then((r) => setMessages(r.data)).catch((e) => setLoadError(errorMessage(e)));
  }, [tab]);
  useEffect(() => { setMessages(null); load(); }, [load]);

  const act = async (m, action, okText) => {
    try { await api.put(`/messages/${m.id}/${action}`); if (okText) toast.success(okText); load(); refreshStats(); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  const toggle = (m) => {
    setOpen(open === m.id ? null : m.id);
    if (open !== m.id && m.status === 'unread') act(m, 'read');
  };

  const confirmDelete = async () => {
    try { await api.delete(`/messages/${deleting.id}`); toast.success('Message deleted.'); setDeleting(null); load(); refreshStats(); }
    catch (err) { toast.error(errorMessage(err)); setDeleting(null); }
  };

  return (
    <>
      <PageHeader title="Contact messages" description="Messages sent through the contact form on your portfolio." />
      <div className="mb-5 flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter messages">
        {TABS.map(([value, label]) => (
          <button key={label} role="tab" aria-selected={tab === value} type="button" onClick={() => setTab(value)}
            className={`btn btn-sm shrink-0 ${tab === value ? 'bg-raised text-ink' : 'btn-ghost'}`}>{label}</button>
        ))}
      </div>

      {loadError ? <ErrorState message={loadError} onRetry={load} /> : !messages ? <PageSpinner /> : messages.length === 0 ? (
        <EmptyState icon={Inbox} title={tab ? `No ${tab} messages` : 'No messages yet'} text="New contact form submissions will appear here." />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <button type="button" onClick={() => toggle(m)} aria-expanded={open === m.id} className="flex w-full items-start gap-3 p-4 text-left hover:bg-raised/40">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.status === 'unread' ? 'bg-accent' : 'bg-transparent'}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className={`truncate ${m.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>{m.subject}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[m.status]}`}>{m.status}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted">{m.name} · {m.email}</p>
                </div>
                <time className="hidden shrink-0 text-xs text-muted sm:block" dateTime={m.created_at}>{new Date(m.created_at).toLocaleString()}</time>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open === m.id ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {open === m.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-line p-4">
                      <dl className="mb-3 grid gap-1 text-sm sm:grid-cols-[80px_1fr]">
                        <dt className="text-muted">From</dt><dd>{m.name}</dd>
                        <dt className="text-muted">Email</dt><dd><a className="text-accent hover:underline" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>{m.email}</a></dd>
                        <dt className="text-muted">Date</dt><dd>{new Date(m.created_at).toLocaleString()}</dd>
                      </dl>
                      {/* Rendered as text by React, so any markup a visitor typed stays inert. */}
                      <p className="whitespace-pre-wrap break-words rounded-md bg-base p-3.5 text-sm leading-relaxed">{m.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.status === 'unread' ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => act(m, 'read', 'Marked as read.')}><MailOpen className="h-3.5 w-3.5" aria-hidden /> Mark read</button>
                          : <button type="button" className="btn btn-secondary btn-sm" onClick={() => act(m, 'unread', 'Marked as unread.')}><Mail className="h-3.5 w-3.5" aria-hidden /> Mark unread</button>}
                        {m.status !== 'archived' && <button type="button" className="btn btn-secondary btn-sm" onClick={() => act(m, 'archive', 'Message archived.')}><Archive className="h-3.5 w-3.5" aria-hidden /> Archive</button>}
                        <button type="button" className="btn btn-ghost btn-sm hover:!text-danger" onClick={() => setDeleting(m)}><Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog open={Boolean(deleting)} message={`Delete the message “${deleting?.subject}” from ${deleting?.name}? This can’t be undone.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </>
  );
}
