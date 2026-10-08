import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, FileText, FolderKanban, Inbox, LayoutDashboard, Link2, LogOut, Menu, Settings, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { PageSpinner } from '../components/ui';
import ThemeToggle from '../components/ThemeToggle';

const NAV = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/dashboard/about', label: 'About', icon: User },
  { to: '/admin/dashboard/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/dashboard/messages', label: 'Messages', icon: Inbox, badge: true },
  { to: '/admin/dashboard/social', label: 'Social links', icon: Link2 },
  { to: '/admin/dashboard/resume', label: 'Resume', icon: FileText },
  { to: '/admin/dashboard/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ unread, onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5"><p className="font-display text-lg font-semibold">Portfolio CMS<span className="text-accent">.</span></p></div>
      <nav className="flex-1 space-y-0.5 px-2" aria-label="Admin">
        {NAV.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm transition-colors ${isActive ? 'bg-raised text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink'}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge && unread > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-ink" aria-label={`${unread} unread`}>{unread}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-line p-2">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm text-muted hover:bg-raised/60 hover:text-ink"><ExternalLink className="h-[18px] w-[18px]" aria-hidden /> View site</a>
        <button type="button" onClick={onLogout} className="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-sm text-muted hover:bg-raised/60 hover:text-ink"><LogOut className="h-[18px] w-[18px]" aria-hidden /> Sign out</button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [drawer, setDrawer] = useState(false);

  const refreshStats = useCallback(() => api.get('/stats').then((r) => setStats(r.data)).catch(() => {}), []);

  useEffect(() => { if (user) refreshStats(); }, [user, refreshStats]);
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    document.title = 'Admin — Portfolio CMS';
    const meta = document.createElement('meta');
    meta.name = 'robots'; meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (loading) return <PageSpinner label="Checking your session…" />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  const onLogout = async () => {
    await logout();
    toast.success('Signed out.');
  };
  const unread = stats?.unread_messages || 0;

  return (
    <div className="min-h-screen bg-base lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface lg:block"><SidebarContent unread={unread} onLogout={onLogout} /></aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-base/90 px-4 backdrop-blur-md lg:px-8">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-raised lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
          <p className="hidden text-sm text-muted lg:block">Signed in as {user.email}</p>
          <p className="font-display font-semibold lg:hidden">Portfolio CMS</p>
          <div className="flex items-center gap-1"><ThemeToggle /><Link to="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">View site</Link></div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8"><Outlet context={{ stats, refreshStats }} /></main>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} aria-hidden="true" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative h-full w-[17rem] border-r border-line bg-surface">
              <button type="button" className="absolute right-2 top-3 flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-raised" onClick={() => setDrawer(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
              <SidebarContent unread={unread} onNavigate={() => setDrawer(false)} onLogout={onLogout} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
