import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { assetUrl } from '../services/api';

export default function ProjectCard({ project, wide }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`group relative h-full overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent/50 hover:shadow-xl hover:shadow-black/10 ${wide ? 'md:grid md:grid-cols-[1.1fr_1fr]' : ''}`}
    >
      <div className={`overflow-hidden bg-raised ${wide ? 'aspect-[16/10] md:aspect-auto' : 'aspect-[16/10]'}`}>
        {project.cover_image ? (
          <img src={assetUrl(project.cover_image)} alt={`${project.name} cover`} loading="lazy" decoding="async" width="1600" height="900" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-muted">{project.name}</div>
        )}
      </div>

      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-center gap-3 text-sm text-muted">
          {project.year && <span>{project.year}</span>}
          {project.featured && <span className="inline-flex items-center gap-1 text-accent"><Star className="h-3.5 w-3.5 fill-current" aria-hidden /> Featured</span>}
        </div>
        <h3 className="mt-2 text-2xl font-semibold">
          {/* The whole card is clickable through this link's ::after overlay */}
          <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {project.name}
          </Link>
        </h3>
        <p className="mt-2 leading-relaxed text-muted">{project.short_description}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.slice(0, wide ? 8 : 6).map((t, i) => (
            <li key={t} style={{ transitionDelay: `${i * 25}ms` }} className="rounded-full border border-line bg-base px-2.5 py-1 text-xs text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:text-ink">{t}</li>
          ))}
        </ul>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-accent">
          View case study
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </motion.article>
  );
}
