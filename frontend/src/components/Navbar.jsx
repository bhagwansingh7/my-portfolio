import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Download } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { usePortfolio } from '../context/PortfolioContext';
import { assetUrl } from '../services/api';

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

function useActiveSection(enabled) {
  const [active, setActive] = useState('home');
  useEffect(() => {
    if (!enabled) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    const t = setTimeout(() => LINKS.forEach((l) => { const el = document.getElementById(l.id); if (el) observer.observe(el); }), 400);
    return () => { clearTimeout(t); observer.disconnect(); };
  }, [enabled]);
  return active;
}

export default function Navbar() {
  const { portfolio } = usePortfolio();
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(onHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const resume = portfolio?.resume_url ? assetUrl(portfolio.resume_url) : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const linkClass = (id) =>
    `relative rounded-md px-3 py-2 text-sm transition-colors ${onHome && active === id ? 'text-ink' : 'text-muted hover:text-ink'}`;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'border-b border-line bg-base/85 backdrop-blur-md' : 'border-b border-transparent'}`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink">Skip to content</a>
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Primary">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight" aria-label={`${portfolio?.name || 'Portfolio'} — home`}>
          {portfolio?.name || 'Portfolio'}<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <Link to={l.id === 'home' ? '/' : `/#${l.id}`} className={linkClass(l.id)} aria-current={onHome && active === l.id ? 'true' : undefined}>
                {l.label}
                {onHome && active === l.id && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {resume && (
            <a href={resume} download className="btn btn-secondary btn-sm ml-1 hidden md:inline-flex"><Download className="h-3.5 w-3.5" aria-hidden /> Resume</a>
          )}
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-md md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <motion.span animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }} className="block h-0.5 w-5 bg-ink" />
            <motion.span animate={{ opacity: open ? 0 : 1 }} className="block h-0.5 w-5 bg-ink" />
            <motion.span animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }} className="block h-0.5 w-5 bg-ink" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <ul className="container-x flex flex-col py-3">
              {LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link to={l.id === 'home' ? '/' : `/#${l.id}`} onClick={() => setOpen(false)} className="flex min-h-[48px] items-center border-b border-line/60 font-display text-xl">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              {resume && (
                <li className="pt-4 pb-2">
                  <a href={resume} download className="btn btn-primary w-full"><Download className="h-4 w-4" aria-hidden /> Download resume</a>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
