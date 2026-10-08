import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/** Fades, lifts and de-blurs its children once when scrolled into view. */
export function Reveal({ children, delay = 0, y = 16, className, as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </Tag>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease } },
};

export function Stagger({ children, className, as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = 'div' }) {
  const Tag = motion[as];
  return <Tag className={className} variants={item}>{children}</Tag>;
}
