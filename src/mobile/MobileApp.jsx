/* ============================================================================
   MobileApp — the phone-only experience.
   ----------------------------------------------------------------------------
   A deliberately minimal, typography-first reading of the same content the
   desktop site shows, in the same cinematic theme (black / gold / burgundy,
   serif headings). The only heavy thing imported is the 3D chessboard, and it
   is code-split + lazy so it never blocks first paint.

   Hierarchy is recruiter-first: About → Projects → Experience → Education →
   Research → Skills → Certifications → Contact, with a sticky jump-nav to the
   four headline sections.

   All copy/links come from the shared site config — the single source of
   truth the desktop also reads — so the two stay in sync.
   ========================================================================== */

import { useState, useEffect, lazy, Suspense } from 'react';
import {
  identity, meta, resume, projects, experience, education,
  publications, certificates, footer, getSocial, interpolate,
  mobile, availability, assets,
} from '../config';
import useTheme from './useTheme';
import ThemeToggle from './ThemeToggle';
import TechMarquee from './TechMarquee';
import './MobileApp.css';

/* 3D chessboard (three.js ~857 kB) — its own chunk, loaded in parallel so the
   text/CSS paint first while it streams in beside the photo. */
const ChessBoard3D = lazy(() => import('../components/ChessBoard3D'));

/* ── Derived, recruiter-ready content ──────────────────────────────────── */

const TAGLINE = mobile.tagline;
const ROLE = mobile.role;
const SUBROLE = mobile.subrole;
const BIO = meta.person.description;

const linkedin = getSocial('LinkedIn');
const github = getSocial('GitHub');
const scholar = getSocial('Google Scholar');

/* Only surface projects that carry real substance + a live link. */
const FEATURED_PROJECTS = projects.filter(
  (p) => p.title && p.description && p.link && p.link !== '#'
);

/* Newest-first, drop foundational schooling (low signal for recruiters). */
const EDUCATION = education.filter((e) => e.id !== 'ed1').slice().reverse();

const STATS = [
  { value: mobile.cgpa, label: 'CGPA' },
  { value: String(publications.length), label: publications.length === 1 ? 'Publication' : 'Publications' },
  { value: String(experience.length), label: experience.length === 1 ? 'Internship' : 'Internships' },
];

/* Contact rail — GitHub, LinkedIn and scholar only, in that order. */
const CONTACT_LINKS = [github, linkedin, scholar].filter(Boolean);

const YEAR = new Date().getFullYear();

/* ── Tiny presentational helpers ───────────────────────────────────────── */

const Arrow = () => (
  <svg className="m-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

/* Round logo with graceful initials fallback if the image 404s. */
function Logo({ src, alt, fallback }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <span className="m-logo m-logo--fallback" aria-hidden="true">{fallback}</span>;
  return (
    <img className="m-logo" src={src} alt={alt} loading="lazy"
         width="48" height="48" onError={() => setErr(true)} />
  );
}

function SectionTitle({ eyebrow, children, accent, id }) {
  return (
    <header className="m-sec__head">
      <span className="m-eyebrow">{eyebrow}</span>
      <h2 className="m-sec__title" id={id}>
        {children}{accent && <>{' '}<span className="m-text-accent">{accent}</span></>}
      </h2>
    </header>
  );
}

/* Premium project card — cover with kind badge + index, then editorial body. */
function ProjectCard({ p, index }) {
  const [imgErr, setImgErr] = useState(false);
  const showMedia = p.image && !imgErr;
  return (
    <a className="m-proj" href={p.link} target="_blank" rel="noreferrer">
      <div className={`m-proj__media${showMedia ? '' : ' m-proj__media--empty'}`}>
        {showMedia && (
          <img src={p.image} alt={p.alt || p.title} loading="lazy" onError={() => setImgErr(true)} />
        )}
        {p.kind && <span className="m-proj__kind">{p.kind}</span>}
        <span className="m-proj__num">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="m-proj__body">
        <h3 className="m-proj__title">{p.title}</h3>
        <p className="m-proj__desc">{p.description}</p>
        <ul className="m-tags">
          {p.tags.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <span className="m-proj__cta">View project <Arrow /></span>
      </div>
    </a>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function MobileApp() {
  const { theme, toggle } = useTheme();

  /* Flag <html> so MobileApp.css can flip the globally-dark, scroll-locked
     base (index.css) into a normally-scrolling, themed page — scoped so the
     desktop build (which never mounts this) is completely unaffected. */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('m-active');
    return () => html.classList.remove('m-active');
  }, []);

  return (
    <div className="m-root">
      {/* ── Sticky header: name + theme toggle (top-right) ── */}
      <header className="m-header">
        <a href="#about" className="m-header__brand">{identity.shortName}</a>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>

      {/* ── Jump-nav to the four recruiter-priority sections ── */}
      <nav className="m-quicknav" aria-label="Sections">
        {mobile.quicknav.map((n) => (
          <a key={n.href} href={n.href}>{n.label}</a>
        ))}
      </nav>

      <main className="m-main">

        {/* ── HERO / ABOUT ── */}
        <section className="m-hero" id="about" aria-label="About">
          {/* Photo + spinning 3D chessboard, side by side. */}
          <div className="m-hero__intro">
            <div className="m-hero__photo">
              <Logo src={assets.portraits[0]} alt={identity.name} fallback={identity.initials} />
            </div>
            <div className="m-hero__chess" aria-label="3D chessboard — tap to play me on Chess.com">
              <Suspense fallback={<div className="m-hero__chess-ph" aria-hidden="true" />}>
                <ChessBoard3D />
              </Suspense>
            </div>
          </div>

          <h1 className="m-hero__name">{identity.shortName}</h1>
          <p className="m-hero__role">{ROLE}</p>
          <p className="m-hero__subrole">{SUBROLE}</p>

          <span className="m-avail">
            <span className="m-avail__dot" aria-hidden="true" />
            {availability.label}
          </span>

          <p className="m-hero__tagline">{TAGLINE}</p>
          <p className="m-hero__bio">{BIO}</p>

          <ul className="m-stats" aria-label="Highlights">
            {STATS.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>

          <div className="m-actions">
            <a className="m-btn m-btn--primary" href={`mailto:${identity.email}`}>Email me</a>
            <a className="m-btn m-btn--ghost" href={resume.url} download={resume.filename}>Résumé</a>
            {linkedin && <a className="m-btn m-btn--ghost" href={linkedin.link} target="_blank" rel="noreferrer">LinkedIn</a>}
            {github && <a className="m-btn m-btn--ghost" href={github.link} target="_blank" rel="noreferrer">GitHub</a>}
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section className="m-sec" id="projects" aria-label="Projects">
          <SectionTitle eyebrow={mobile.sections.projects.eyebrow} accent={mobile.sections.projects.headingAccent}>{mobile.sections.projects.title}</SectionTitle>
          <div className="m-cards">
            {FEATURED_PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} p={p} index={i} />
            ))}
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        <section className="m-sec" id="experience" aria-label="Experience">
          <SectionTitle eyebrow={mobile.sections.experience.eyebrow} accent={mobile.sections.experience.headingAccent}>{mobile.sections.experience.title}</SectionTitle>
          <div className="m-list">
            {experience.map((e) => (
              <a className="m-row" key={e.id} href={e.url} target="_blank" rel="noreferrer">
                <Logo src={e.logo} alt={e.company} fallback={e.company.slice(0, 2)} />
                <div className="m-row__body">
                  <div className="m-row__line">
                    <h3 className="m-row__title">{e.title}</h3>
                    <span className="m-row__meta">{e.period}</span>
                  </div>
                  <p className="m-row__sub">{e.company}</p>
                  <p className="m-row__desc">{e.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── EDUCATION ── */}
        <section className="m-sec" id="education" aria-label="Education">
          <SectionTitle eyebrow={mobile.sections.education.eyebrow} accent={mobile.sections.education.headingAccent}>{mobile.sections.education.title}</SectionTitle>
          <div className="m-list">
            {EDUCATION.map((e) => (
              <a className="m-row" key={e.id} href={e.url} target="_blank" rel="noreferrer">
                <Logo src={e.logo} alt={e.institution} fallback={e.institution.slice(0, 2)} />
                <div className="m-row__body">
                  <div className="m-row__line">
                    <h3 className="m-row__title">{e.degree}</h3>
                    <span className="m-row__meta">{e.period}</span>
                  </div>
                  <p className="m-row__sub">{e.institution}</p>
                  {e.focus && <p className="m-row__desc m-row__desc--accent">{e.focus}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── RESEARCH ── */}
        <section className="m-sec" id="research" aria-label="Research">
          <SectionTitle eyebrow={mobile.sections.research.eyebrow} accent={mobile.sections.research.headingAccent}>{mobile.sections.research.title}</SectionTitle>
          <div className="m-list">
            {publications.map((p) => (
              <a className="m-pub" key={p.id} href={p.url} target="_blank" rel="noreferrer">
                <span className="m-pub__venue">{p.venue}</span>
                <h3 className="m-pub__title">{p.title}</h3>
                {p.description && <p className="m-pub__desc">{p.description}</p>}
                <span className="m-pub__read">Read paper <Arrow /></span>
              </a>
            ))}
          </div>
        </section>

        {/* ── TECH STACK (two-line auto-loop marquee) ── */}
        <section className="m-sec" id="skills" aria-label="Tech stack">
          <SectionTitle eyebrow={mobile.sections.skills.eyebrow} accent={mobile.sections.skills.headingAccent}>{mobile.sections.skills.title}</SectionTitle>
        </section>
        <TechMarquee />

        {/* ── CERTIFICATIONS ── */}
        <section className="m-sec" id="certs" aria-label="Certifications">
          <SectionTitle eyebrow={mobile.sections.certs.eyebrow} accent={mobile.sections.certs.headingAccent}>{mobile.sections.certs.title}</SectionTitle>
          <div className="m-list">
            {certificates.map((c) => {
              const inner = (
                <>
                  <div className="m-cert__body">
                    <h3 className="m-cert__title">{c.title}</h3>
                    <p className="m-cert__meta">{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>
                  </div>
                  {c.url && <Arrow />}
                </>
              );
              return c.url
                ? <a className="m-cert" key={c.id} href={c.url} target="_blank" rel="noreferrer">{inner}</a>
                : <div className="m-cert" key={c.id}>{inner}</div>;
            })}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="m-sec m-contact" id="contact" aria-label="Contact">
          <SectionTitle eyebrow={mobile.sections.contact.eyebrow} accent={mobile.sections.contact.headingAccent}>{mobile.sections.contact.title}</SectionTitle>
          <p className="m-contact__lead">
            {mobile.contactLead}
          </p>

          <div className="m-actions m-actions--stacked">
            <a className="m-btn m-btn--primary" href={`mailto:${identity.email}`}>{identity.email}</a>
            <a className="m-btn m-btn--ghost" href={resume.url} download={resume.filename}>Download résumé</a>
          </div>

          <ul className="m-socials" aria-label="Social profiles">
            {CONTACT_LINKS.map((s) => (
              <li key={s.id}>
                <a href={s.link} target="_blank" rel="noreferrer">
                  <span className="m-socials__plat">{s.platform}</span>
                  <span className="m-socials__handle">{s.handle}</span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="m-footer">
        {interpolate(footer.copyrightTemplate, { year: YEAR })}
      </footer>
    </div>
  );
}
