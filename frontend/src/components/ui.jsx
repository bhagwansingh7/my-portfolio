import { motion } from 'framer-motion';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';

export const Spinner = ({ className = 'h-5 w-5' }) => <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;

export const PageSpinner = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[40vh] items-center justify-center gap-3 text-muted" role="status">
    <Spinner /> <span className="text-sm">{label}</span>
  </div>
);

export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-muted" aria-hidden="true" />
      <p className="mt-4 font-display text-lg font-semibold">{title}</p>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'We could not load this content.', onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-12 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-danger" aria-hidden="true" />
      <p className="mt-4 font-display text-lg font-semibold">Something went wrong</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && <button type="button" className="btn btn-secondary mt-5" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export const MotionButton = ({ className = '', children, ...props }) => (
  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className={className} {...props}>{children}</motion.button>
);

export const SectionHeading = ({ id, title, description }) => (
  <div className="mb-10 max-w-2xl sm:mb-14">
    <h2 id={id} className="text-3xl font-semibold sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
  </div>
);
