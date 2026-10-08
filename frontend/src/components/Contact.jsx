import { Mail, MapPin } from 'lucide-react';
import { Reveal } from './Reveal';
import { SectionHeading } from './ui';
import { SocialIcon } from './icons';
import ContactForm from './ContactForm';

export default function Contact({ portfolio, socials }) {
  const email = portfolio.public_email;
  return (
    <section id="contact" className="section-y border-t border-line" aria-labelledby="contact-title">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading id="contact-title" title="Get in touch" description="Have a role, an internship or a project in mind? Send a message and I’ll get back to you." />
          <Reveal className="space-y-3 text-sm">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-ink hover:text-accent"><Mail className="h-[18px] w-[18px] text-accent" aria-hidden /> {email}</a>
            )}
            {portfolio.location && <p className="flex items-center gap-3 text-muted"><MapPin className="h-[18px] w-[18px] text-accent" aria-hidden /> {portfolio.location}</p>}
            <ul className="flex flex-wrap gap-2 pt-3">
              {socials.filter((s) => s.platform !== 'email').map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><SocialIcon platform={s.platform} className="h-4 w-4" /> {s.label}</a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal><ContactForm /></Reveal>
      </div>
    </section>
  );
}
