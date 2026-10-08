import { useMemo } from 'react';
import { Wrench } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { EmptyState, SectionHeading } from './ui';
import { SkillIcon } from './icons';

export default function Skills({ skills }) {
  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((s) => { if (!map.has(s.category)) map.set(s.category, []); map.get(s.category).push(s); });
    return [...map.entries()];
  }, [skills]);

  return (
    <section id="skills" className="section-y border-t border-line" aria-labelledby="skills-title">
      <div className="container-x">
        <SectionHeading id="skills-title" title="Skills" description="The languages, tools and fundamentals I reach for when building and shipping software." />
        {groups.length === 0 ? (
          <EmptyState icon={Wrench} title="Skills are being updated" text="Check back soon." />
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {groups.map(([category, items]) => (
              <div key={category} className="grid gap-4 py-7 md:grid-cols-[220px_1fr] md:gap-10">
                <Reveal as="h3" className="font-display text-lg font-semibold md:pt-2">{category}</Reveal>
                <Stagger as="ul" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((s) => (
                    <StaggerItem as="li" key={s.id}>
                      <div className="group flex h-full flex-col justify-center rounded-md border border-line bg-surface px-3.5 py-3 transition-colors hover:border-accent/50 hover:bg-raised">
                        <div className="flex items-center gap-2.5">
                          <SkillIcon name={s.icon} className="h-[18px] w-[18px] shrink-0 text-accent transition-transform duration-200 group-hover:scale-110" />
                          <span className="text-sm font-medium leading-tight">{s.name}</span>
                        </div>
                        {s.level != null && (
                          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-raised" role="img" aria-label={`Proficiency ${s.level} percent`}>
                            <div className="h-full origin-left rounded-full bg-accent" style={{ width: `${s.level}%` }} />
                          </div>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
