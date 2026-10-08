import { motion } from 'framer-motion';

/** Decorative "API trace" built from the real content counts. One orchestrated entrance, then it rests. */
export default function RequestLog({ counts }) {
  const lines = [
    { m: 'GET', p: '/api/portfolio', s: 200, t: '14ms' },
    { m: 'GET', p: '/api/projects', s: 200, t: '22ms', note: `${counts.projects} projects` },
    { m: 'GET', p: '/api/skills', s: 200, t: '9ms', note: `${counts.skills} skills` },
    { m: 'POST', p: '/api/contact', s: 201, t: '31ms', note: 'stored in MySQL' },
  ];
  return (
    <div aria-hidden="true" className="w-full max-w-[19rem] rounded-md border border-line bg-surface/90 p-3.5 font-mono text-[11.5px] leading-relaxed shadow-xl backdrop-blur-sm">
      {lines.map((l, i) => (
        <motion.div key={l.p} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.28, duration: 0.3 }} className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="w-9 text-accent">{l.m}</span>
          <span className="text-ink">{l.p}</span>
          <span className="ml-auto text-success">{l.s}</span>
          <span className="w-9 text-right text-muted">{l.t}</span>
        </motion.div>
      ))}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-1.5 text-muted">
        {counts.projects} projects · {counts.skills} skills<span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-accent animate-blink" />
      </motion.p>
    </div>
  );
}
