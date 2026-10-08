import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import api, { assetUrl, errorMessage } from '../services/api';
import useSeo from '../hooks/useSeo';
import { Reveal } from '../components/Reveal';
import { ErrorState, Skeleton } from '../components/ui';
import NotFound from './NotFound';
import Modal from '../components/Modal';

function Block({ title, children }) {
  if (!children) return null;
  return (
    <Reveal as="section" className="grid gap-3 border-t border-line py-8 md:grid-cols-[200px_1fr] md:gap-10">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div>{children}</div>
    </Reveal>
  );
}

const List = ({ items }) => (items?.length ? (
  <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">{items.map((f, i) => <li key={i}>{f}</li>)}</ul>
) : null);

export default function ProjectDetails() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', project: null, error: '' });
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(() => {
    setState({ status: 'loading', project: null, error: '' });
    api.get(`/projects/${encodeURIComponent(slug)}`)
      .then((res) => setState({ status: 'ready', project: res.data, error: '' }))
      .catch((err) => setState({ status: err.response?.status === 404 ? 'missing' : 'error', project: null, error: errorMessage(err) }));
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  const p = state.project;
  useSeo({
    title: p ? `${p.name} — Project case study` : 'Project',
    description: p?.short_description,
    image: p?.cover_image,
    type: 'article',
  });

  if (state.status === 'missing') return <NotFound />;
  if (state.status === 'error') return <div className="container-x pt-32"><ErrorState message={state.error} onRetry={load} /></div>;
  if (state.status === 'loading') {
    return (
      <div className="container-x pt-28" aria-busy="true" aria-label="Loading project">
        <Skeleton className="h-6 w-32" /><Skeleton className="mt-6 h-12 w-2/3" /><Skeleton className="mt-8 aspect-[16/8] w-full" />
      </div>
    );
  }

  const screenshots = (p.images || []).filter((i) => i.url !== p.cover_image || p.images.length > 1);

  return (
    <article className="pb-24 pt-24 sm:pt-28">
      <div className="container-x">
        <Link to="/#projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden /> All projects</Link>

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm text-muted">{p.year}{p.featured ? ' · Featured project' : ''}</p>
            <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{p.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{p.short_description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><Github className="h-4 w-4" aria-hidden /> Source code</a>}
            {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><ExternalLink className="h-4 w-4" aria-hidden /> Live demo</a>}
          </div>
        </header>

        {p.cover_image && (
          <Reveal className="mt-10">
            <img src={assetUrl(p.cover_image)} alt={`${p.name} hero`} width="1600" height="900" fetchpriority="high" decoding="async" className="aspect-[16/9] w-full rounded-lg border border-line object-cover" />
          </Reveal>
        )}

        <div className="mt-12">
          <Block title="Overview"><p className="prose-plain max-w-3xl">{p.description}</p></Block>
          <Block title="Problem"><p className="prose-plain max-w-3xl">{p.problem}</p></Block>
          <Block title="Solution"><p className="prose-plain max-w-3xl">{p.solution}</p></Block>
          {p.features.length > 0 && <Block title="Features"><List items={p.features} /></Block>}
          {p.technologies.length > 0 && (
            <Block title="Tech stack">
              <ul className="flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm">{t}</li>)}</ul>
            </Block>
          )}
          <Block title="Architecture"><p className="prose-plain max-w-3xl">{p.architecture}</p></Block>
          {screenshots.length > 0 && (
            <Block title="Screenshots">
              <ul className="grid gap-4 sm:grid-cols-2">
                {screenshots.map((img) => (
                  <li key={img.id}>
                    <button type="button" onClick={() => setLightbox(img)} className="group block w-full overflow-hidden rounded-md border border-line text-left" aria-label={`Enlarge screenshot${img.caption ? `: ${img.caption}` : ''}`}>
                      <img src={assetUrl(img.url)} alt={img.caption || `${p.name} screenshot`} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    </button>
                    {img.caption && <p className="mt-1.5 text-sm text-muted">{img.caption}</p>}
                  </li>
                ))}
              </ul>
            </Block>
          )}
          <Block title="Challenges"><p className="prose-plain max-w-3xl">{p.challenges}</p></Block>
          {(p.engineering_decisions || p.highlights.length > 0) && (
            <Block title="Engineering decisions">
              {p.engineering_decisions && <p className="prose-plain max-w-3xl">{p.engineering_decisions}</p>}
              {p.highlights.length > 0 && <div className="mt-4"><List items={p.highlights} /></div>}
            </Block>
          )}
        </div>
      </div>

      <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} title={lightbox?.caption || 'Screenshot'} size="xl">
        {lightbox && <img src={assetUrl(lightbox.url)} alt={lightbox.caption || `${p.name} screenshot`} className="w-full rounded-md" />}
      </Modal>
    </article>
  );
}
