import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import useSeo from '../hooks/useSeo';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import { ErrorState, Skeleton } from '../components/ui';

function HomeSkeleton() {
  return (
    <div className="container-x pt-32" aria-busy="true" aria-label="Loading portfolio">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Skeleton className="h-8 w-56 rounded-full" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-8 w-full max-w-lg" />
          <Skeleton className="h-20 w-full max-w-lg" />
          <div className="flex gap-3"><Skeleton className="h-11 w-36" /><Skeleton className="h-11 w-36" /></div>
        </div>
        <Skeleton className="aspect-[4/5] w-full max-w-sm" />
      </div>
    </div>
  );
}

export default function Home() {
  const { status, portfolio, skills, projects, socials, reload } = usePortfolio();
  const { hash, key } = useLocation();

  useSeo({
    title: portfolio?.settings?.site_title || (portfolio ? `${portfolio.name} — Full-Stack Developer` : 'Portfolio'),
    description: portfolio?.settings?.meta_description || portfolio?.headline,
    image: portfolio?.profile_image,
  });

  useEffect(() => {
    if (status !== 'ready') return undefined;
    const t = setTimeout(() => {
      const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (!hash) window.scrollTo(0, 0);
    }, 120);
    return () => clearTimeout(t);
  }, [hash, key, status]);

  if (status === 'loading') return <HomeSkeleton />;
  if (status === 'error') return <div className="container-x pt-32"><ErrorState message="The portfolio could not be loaded. The server may be starting up." onRetry={reload} /></div>;

  return (
    <>
      <Hero portfolio={portfolio} socials={socials} counts={{ projects: projects.length, skills: skills.length }} />
      <About portfolio={portfolio} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Contact portfolio={portfolio} socials={socials} />
    </>
  );
}
