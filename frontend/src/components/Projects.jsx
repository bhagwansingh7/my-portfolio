import { FolderOpen } from 'lucide-react';
import { Stagger, StaggerItem } from './Reveal';
import { EmptyState, SectionHeading } from './ui';
import ProjectCard from './ProjectCard';

export default function Projects({ projects }) {
  return (
    <section id="projects" className="section-y border-t border-line" aria-labelledby="projects-title">
      <div className="container-x">
        <SectionHeading id="projects-title" title="Projects" description="Selected work with the problem, the solution and the engineering decisions behind it." />
        {projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title="Projects are currently being updated" text="Check back soon." />
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <StaggerItem key={p.id} className={i === 0 && p.featured ? 'md:col-span-2' : 'h-full'}>
                <ProjectCard project={p} wide={i === 0 && p.featured} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
