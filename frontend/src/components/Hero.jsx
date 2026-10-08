import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { ArrowDown, Download, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import RequestLog from './RequestLog';
import { SocialIcon } from './icons';
import { assetUrl } from '../services/api';

const ease = [0.22, 1, 0.36, 1];

export default function Hero({ portfolio, socials, counts }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const spotlight = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.10), transparent 70%)`;
  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const words = portfolio.name.split(' ');
  const resume = portfolio.resume_url ? assetUrl(portfolio.resume_url) : null;
  const emailLink = socials.find((s) => s.platform === 'email');

  return (
    <section id="home" onPointerMove={onMove} className="relative overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-36 lg:pt-40" aria-labelledby="hero-title">
      {/* Background: drifting grid, slow glow, cursor spotlight */}
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          {portfolio.settings?.availability_text && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {portfolio.settings.availability_text}
            </motion.p>
          )}

          <h1 id="hero-title" className="text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
            <span className="sr-only">{portfolio.name}</span>
            <span aria-hidden="true" className="flex flex-wrap gap-x-[0.28em]">
              {words.map((w, i) => (
                <span key={`${w}-${i}`} className="overflow-hidden pb-1">
                  <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease }}>{w}</motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease }} className="mt-5 max-w-xl text-xl leading-snug text-ink/90 sm:text-2xl">
            {portfolio.headline}
          </motion.p>
          {portfolio.intro && (
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease }} className="mt-4 max-w-xl leading-relaxed text-muted">
              {portfolio.intro}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55, ease }} className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/#projects" className="btn btn-primary">View projects <ArrowDown className="h-4 w-4" aria-hidden /></Link>
            <Link to="/#contact" className="btn btn-secondary"><Mail className="h-4 w-4" aria-hidden /> Contact me</Link>
            {resume && <a href={resume} download className="btn btn-ghost"><Download className="h-4 w-4" aria-hidden /> Resume</a>}
          </motion.div>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }} className="mt-8 flex items-center gap-1" aria-label="Social links">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target={s.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" aria-label={s.label}
                   className="flex h-11 w-11 items-center justify-center rounded-md border border-transparent text-muted transition-colors hover:border-line hover:bg-surface hover:text-ink">
                  <SocialIcon platform={s.platform} className="h-5 w-5" />
                </a>
              </li>
            ))}
            {!emailLink && portfolio.public_email && (
              <li>
                <a href={`mailto:${portfolio.public_email}`} aria-label="Email" className="flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"><Mail className="h-5 w-5" aria-hidden /></a>
              </li>
            )}
          </motion.ul>
        </div>

        {/* Portrait with clip reveal; floating outlines stay subtle */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0% 0 0 0)' }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
            className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-surface"
          >
            {portfolio.profile_image ? (
              <img src={assetUrl(portfolio.profile_image)} alt={`Portrait of ${portfolio.name}`} width="800" height="1000" fetchpriority="high" decoding="async" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-7xl text-muted">{portfolio.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
            )}
          </motion.div>
          <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-3 -z-10 h-full w-full rounded-md border border-accent/30" />
          <div aria-hidden="true" className="absolute -left-4 top-10 hidden h-10 w-10 animate-float rounded-md border border-accent/40 sm:block" />
          <div aria-hidden="true" className="absolute -right-5 bottom-24 hidden h-5 w-5 animate-float rounded-full border border-accent/50 [animation-delay:2s] sm:block" />
          <div className="relative z-10 -mt-12 ml-3 sm:-ml-6 sm:-mt-16"><RequestLog counts={counts} /></div>
        </div>
      </div>
    </section>
  );
}
