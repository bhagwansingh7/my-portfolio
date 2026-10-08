import { ArrowUp } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SocialIcon } from './icons';

export default function Footer() {
  const { portfolio, socials } = usePortfolio();
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <p className="text-sm text-muted">© {new Date().getFullYear()} {portfolio?.name}. Built with React, Express and MySQL.</p>
        <div className="flex items-center gap-1">
          {socials.map((s) => (
            <a key={s.id} href={s.url} target={s.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" aria-label={s.label}
               className="flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink">
              <SocialIcon platform={s.platform} className="h-[18px] w-[18px]" />
            </a>
          ))}
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn btn-ghost btn-sm ml-2">
            <ArrowUp className="h-3.5 w-3.5" aria-hidden /> Top
          </button>
        </div>
      </div>
    </footer>
  );
}
