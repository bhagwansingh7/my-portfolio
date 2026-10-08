import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/** Optional soft cursor ring. Desktop (fine pointer) only, disabled for reduced motion. */
export default function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    setEnabled(true);
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setHot(Boolean(e.target.closest?.('a, button, [role="button"], input, textarea, select'))); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-accent/70"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: hot ? 44 : 22, height: hot ? 44 : 22, opacity: hot ? 0.9 : 0.55 }}
      transition={{ duration: 0.18 }}
    />
  );
}
