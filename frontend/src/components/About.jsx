import { Award, GraduationCap, Sparkles, Target } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './ui';
import { assetUrl } from '../services/api';

export default function About({ portfolio }) {
  const paragraphs = (portfolio.bio || '').split(/\n{2,}/).filter(Boolean);
  const hasEducation = portfolio.education?.length > 0;
  const hasAchievements = portfolio.achievements?.length > 0;

  return (
    <section id="about" className="section-y border-t border-line" aria-labelledby="about-title">
      <div className="container-x">
        <SectionHeading id="about-title" title="About" />
        <div className="grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
          <Reveal className="hidden lg:block">
            <div className="sticky top-24">
              {portfolio.profile_image && (
                <img src={assetUrl(portfolio.profile_image)} alt={`${portfolio.name}, full-stack developer`} loading="lazy" decoding="async" width="640" height="800" className="aspect-[4/5] w-full rounded-md border border-line object-cover" />
              )}
              {portfolio.location && <p className="mt-3 text-sm text-muted">Based in {portfolio.location}</p>}
            </div>
          </Reveal>

          <div className="space-y-12">
            <Reveal className="max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink/90">
              {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-muted">About details are coming soon.</p>}
            </Reveal>

            {portfolio.developer_focus && (
              <Reveal>
                <h3 className="flex items-center gap-2 text-lg font-semibold"><Target className="h-[18px] w-[18px] text-accent" aria-hidden /> Developer focus</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-muted">{portfolio.developer_focus}</p>
              </Reveal>
            )}

            {hasEducation && (
              <Reveal>
                <h3 className="flex items-center gap-2 text-lg font-semibold"><GraduationCap className="h-[18px] w-[18px] text-accent" aria-hidden /> Education</h3>
                <ol className="mt-4 space-y-5 border-l border-line pl-5">
                  {portfolio.education.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                      <p className="font-medium">{e.degree}</p>
                      <p className="text-sm text-muted">{e.institution}{e.period ? ` · ${e.period}` : ''}</p>
                      {e.details && <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{e.details}</p>}
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            {hasAchievements && (
              <Reveal>
                <h3 className="flex items-center gap-2 text-lg font-semibold"><Award className="h-[18px] w-[18px] text-accent" aria-hidden /> Achievements</h3>
                <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 text-muted marker:text-accent">
                  {portfolio.achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </Reveal>
            )}

            {portfolio.current_focus && (
              <Reveal>
                <div className="max-w-2xl rounded-md border border-accent/30 bg-accent/5 p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-accent" aria-hidden /> Currently focused on</p>
                  <p className="mt-1.5 leading-relaxed text-ink/90">{portfolio.current_focus}</p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
