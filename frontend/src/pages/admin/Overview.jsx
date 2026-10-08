import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FolderKanban, Inbox, Mail, MessageSquare, Sparkles, Star } from 'lucide-react';
import api from '../../services/api';
import PageHeader from '../../components/admin/PageHeader';
import { Skeleton } from '../../components/ui';

const CARDS = [
  { key: 'projects', label: 'Total projects', icon: FolderKanban, to: 'projects' },
  { key: 'skills', label: 'Total skills', icon: Sparkles, to: 'skills' },
  { key: 'unread_messages', label: 'Unread messages', icon: Mail, to: 'messages', accent: true },
  { key: 'messages', label: 'Total messages', icon: MessageSquare, to: 'messages' },
  { key: 'featured_projects', label: 'Featured projects', icon: Star, to: 'projects' },
];

export default function Overview() {
  const { stats, refreshStats } = useOutletContext();
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    refreshStats();
    api.get('/messages').then((r) => setRecent(r.data.filter((m) => m.status !== 'archived').slice(0, 5))).catch(() => setRecent([]));
  }, [refreshStats]);

  return (
    <>
      <PageHeader title="Overview" description="A snapshot of your portfolio. Changes you save here appear on the public site straight away." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {CARDS.map(({ key, label, icon: Icon, to, accent }) => (
          <Link key={key} to={to} className="card p-4 transition-colors hover:border-accent/50 sm:p-5">
            <Icon className={`h-5 w-5 ${accent ? 'text-accent' : 'text-muted'}`} aria-hidden />
            {stats ? <p className="mt-3 font-display text-3xl font-semibold">{stats[key]}</p> : <Skeleton className="mt-3 h-9 w-12" />}
            <p className="mt-0.5 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <section className="card mt-8" aria-labelledby="recent">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id="recent" className="font-display text-lg font-semibold">Recent messages</h2>
          <Link to="messages" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        {recent === null ? (
          <div className="space-y-3 p-5"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center text-muted"><Inbox className="h-7 w-7" aria-hidden /><p className="mt-3 text-sm">No messages yet. Contact form submissions will appear here.</p></div>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.status === 'unread' ? 'bg-accent' : 'bg-line'}`} aria-label={m.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.subject}</p>
                  <p className="truncate text-sm text-muted">{m.name} · {m.email}</p>
                </div>
                <time className="shrink-0 text-xs text-muted" dateTime={m.created_at}>{new Date(m.created_at).toLocaleDateString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
