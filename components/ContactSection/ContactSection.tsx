'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { CONTACT } from '@/content/contact';
import { useUIStore } from '@/store/ui';
import styles from './ContactSection.module.css';

const COFFEE_COUNT = 84;

function InstagramIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface ContactSectionProps {
  isPage?: boolean;
}

export function ContactSection({ isPage = false }: ContactSectionProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const hasEntered  = useRef(false);

  const labelRef    = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef  = useRef<HTMLDivElement>(null);
  const statRef     = useRef<HTMLDivElement>(null);
  const numRef      = useRef<HTMLSpanElement>(null);
  const formRef     = useRef<HTMLFormElement>(null);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isPage) {
      // Dedicated page — set immediately, no observer needed
      setNavTheme('light');
      setNavStyle('minimal');
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('minimal');
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isPage, setNavTheme, setNavStyle]);

  /* ── Entrance animation ───────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const leftEls = [labelRef.current, headlineRef.current, taglineRef.current, statRef.current].filter(Boolean);

    gsap.set(leftEls,         { opacity: 0, y: 16 });
    gsap.set(formRef.current, { opacity: 0, y: 20 });

    function runEntrance() {
      if (hasEntered.current) return;
      hasEntered.current = true;

      gsap.to(leftEls, {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.75, ease: 'power3.out', delay: 0.1,
      });
      gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });

      const obj = { val: 0 };
      gsap.to(obj, {
        val: COFFEE_COUNT,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.5,
        onUpdate() {
          if (numRef.current) numRef.current.textContent = Math.round(obj.val).toString();
        },
        onComplete() {
          if (numRef.current) numRef.current.textContent = COFFEE_COUNT.toString();
        },
      });
    }

    if (isPage) {
      // Fire immediately after first paint
      requestAnimationFrame(() => requestAnimationFrame(runEntrance));
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { runEntrance(); obs.disconnect(); }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = new Date().getFullYear();
  const taglineParagraphs = CONTACT.tagline.split('\n\n');

  return (
    <section
      ref={sectionRef}
      data-snap-section="contact"
      className={`${styles.section} ${isPage ? styles.sectionPage : ''}`}
    >

      {/* ── Main content row ─────────────────────────────────────────── */}
      <div className={styles.mainContent}>

        {/* Left: image background + text */}
        <div className={styles.leftPanel}>
          {/* Background image */}
          <div className={styles.leftBg} style={{ backgroundImage: "url('/images/studio-cover.jpg')" }} />
          {/* Dark gradient overlay */}
          <div className={styles.leftGradient} />

          {/* Text content — grid: label top · headline dead-centre · tagline bottom */}
          <div className={styles.leftContent}>

            {/* Row 1 — label, aligned to bottom of row */}
            <span ref={labelRef} className={styles.sectionLabel}>Get in touch</span>

            {/* Row 2 — headline, dead centre */}
            <h2 ref={headlineRef} className={styles.headline}>{CONTACT.headline}</h2>

            {/* Row 3 — tagline, aligned to top of row */}
            <div ref={taglineRef} className={styles.tagline}>
              {taglineParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Stat — pinned to bottom via absolute */}
            <div ref={statRef} className={styles.stat}>
              <span ref={numRef} className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Coconuts shared with clients</span>
            </div>

          </div>
        </div>

        {/* Right: form */}
        <div className={styles.rightPanel}>
          <form ref={formRef} className={styles.form} onSubmit={e => e.preventDefault()}>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <input
                type="text"
                className={styles.input}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <input
                type="email"
                className={styles.input}
                placeholder="Your email address"
                autoComplete="email"
                required
              />
            </div>


            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <div className={styles.selectWrapper}>
                <select className={styles.select} defaultValue="" required>
                  <option value="" disabled>Looking for:</option>
                  {CONTACT.needs.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <textarea
                className={styles.textarea}
                placeholder="Tell us about your project..."
                rows={3}
                required
              />
            </div>

            <label className={styles.consentLabel}>
              <input type="checkbox" className={styles.consentCheckbox} required />
              <span className={styles.consentText}>
                I consent to my data being stored to process this inquiry. It will not be used for commercial purposes.
              </span>
            </label>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>

          </form>

          {/* Social icons — pinned to bottom, aligned with "84" stat */}
          <div className={styles.socialRow}>
            {CONTACT.socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label={s.label}
              >
                {s.label === 'Instagram' ? <InstagramIcon /> : <WhatsAppIcon />}
              </a>
            ))}
          </div>

          {/* Cookie + copyright — bottom of right column */}
          <div className={styles.rightMeta}>
            <a href="/cookie-policy" className={styles.metaLink}>Cookie Policy</a>
            <span className={styles.metaSep}>·</span>
            <span className={styles.metaCopyright}>© {year} Muem Studio</span>
            <span id="footer-cta" className={styles.footerCtaTarget} aria-hidden="true" />
          </div>

        </div>

      </div>

      {/* Invisible anchor — triggers FloatingCTA snap on scroll ─────── */}
      <div id="footer-marker" className={styles.footerAnchor} aria-hidden="true" />

    </section>
  );
}
