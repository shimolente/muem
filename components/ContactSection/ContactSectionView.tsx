'use client';

import { useRef, useEffect, useState, useTransition } from 'react';
import gsap from 'gsap';
import { CONTACT, type SocialLink } from '@/content/contact';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import { useTranslations } from 'next-intl';
import styles from './ContactSection.module.css';

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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 0 1" />
    </svg>
  );
}

/** Pick the right glyph for a social link by its label. */
function SocialGlyph({ label }: { label: string }) {
  if (/insta/i.test(label)) return <InstagramIcon />;
  if (/whats/i.test(label)) return <WhatsAppIcon />;
  return <InstagramIcon />;
}

interface ContactSectionViewProps {
  isPage?:  boolean;
  socials:  SocialLink[];
  coconuts: number;
}

export function ContactSectionView({ isPage = false, socials, coconuts }: ContactSectionViewProps) {
  const t = useTranslations('contact');
  const sectionRef  = useRef<HTMLElement>(null);
  const innerRef    = useRef<HTMLDivElement>(null);
  const hasEntered  = useRef(false);

  const labelRef    = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef  = useRef<HTMLDivElement>(null);
  const statRef     = useRef<HTMLDivElement>(null);
  const numRef      = useRef<HTMLSpanElement>(null);
  const iconRef     = useRef<HTMLImageElement>(null);
  const [isPending, startTransition] = useTransition();
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMsg, setSubmitMsg] = useState<string>('');
  const formRef     = useRef<HTMLFormElement>(null);

  const setNavTheme   = useUIStore(s => s.setNavTheme);
  const setNavStyle   = useUIStore(s => s.setNavStyle);
  const setNavLogoSrc = useUIStore(s => s.setNavLogoSrc);

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
          scheduleNavUpdate(() => {
            setNavTheme('light');
            setNavStyle('minimal');
            setNavLogoSrc('/logo-and-brandbook/word-only.svg');
          });
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isPage, setNavTheme, setNavStyle, setNavLogoSrc]);

  /* ── Entrance animation ───────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const leftEls = [labelRef.current, headlineRef.current, taglineRef.current, statRef.current].filter(Boolean);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion: show the finished section immediately — no entrance, no
    // wipe, no count-up (jump the coconut counter straight to its final value).
    if (reduced) {
      gsap.set(leftEls,         { opacity: 1, y: 0 });
      gsap.set(formRef.current, { opacity: 1, y: 0 });
      if (numRef.current)  numRef.current.textContent = coconuts.toString();
      if (iconRef.current) gsap.set(iconRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(leftEls,         { opacity: 0, y: 16 });
    gsap.set(formRef.current, { opacity: 0, y: 20 });

    // Clip-path curtain reveal on scroll entry — the content column wipes up
    // "from underneath". We clip the INNER content, never the .section itself:
    // the section keeps its opaque dark background at all times, so the page's
    // position:fixed CategoryHero (which sits behind everything) can never bleed
    // through mid-reveal. Skipped on the standalone /contact page (isPage) and
    // on the snap homepage (WipeTransitions owns the curtain there).
    const onSnapHome = document.documentElement.classList.contains('snap-scroll');
    const useWipe = !isPage && !onSnapHome;
    if (useWipe) innerRef.current?.classList.add(styles.wipeInit);

    function runEntrance() {
      if (hasEntered.current) return;
      hasEntered.current = true;
      if (useWipe) innerRef.current?.classList.add(styles.wipeRevealed);

      gsap.to(leftEls, {
        opacity: 1, y: 0,
        stagger: 0.1, duration: 0.75, ease: 'power3.out', delay: 0.1,
      });
      gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 });

      const obj = { val: 0 };
      gsap.to(obj, {
        val: coconuts,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.5,
        onUpdate() {
          if (numRef.current) numRef.current.textContent = Math.round(obj.val).toString();
        },
        onComplete() {
          if (numRef.current) numRef.current.textContent = coconuts.toString();
          // Drop the coconut icon once the number finishes counting
          if (!iconRef.current) return;
          const isDesktop = window.matchMedia('(min-width: 769px)').matches;
          if (isDesktop) {
            gsap.to(iconRef.current, {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'elastic.out(1, 0.35)',
            });
          } else {
            // Mobile: no drop, just fade in alongside the rest of the layout
            gsap.to(iconRef.current, {
              opacity: 1,
              duration: 0.45,
              ease: 'power3.out',
            });
          }
        },
      });

      // Coconut starts hidden + above its slot — appears only when the
      // counter finishes and the drop animation in onComplete kicks in.
      if (iconRef.current) {
        const isDesktop = window.matchMedia('(min-width: 769px)').matches;
        gsap.set(iconRef.current, { opacity: 0, y: isDesktop ? -18 : 0 });
      }
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
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = new Date().getFullYear();
  const taglineParagraphs = t('tagline').split('\n\n');

  return (
    <section
      ref={sectionRef}
      data-snap-section="contact"
      className={`${styles.section} ${isPage ? styles.sectionPage : ''}`}
    >

      {/* ── Centered single-column layout ───────────────────────────── */}
      <div ref={innerRef} className={styles.inner}>

        {/* Header — eyebrow · headline · tagline, dead-centre */}
        <div className={styles.header}>
          <span ref={labelRef} className={styles.sectionLabel}>{t('label')}</span>
          {isPage ? (
            <h1 ref={headlineRef} className={styles.headline}>{t('headline')}</h1>
          ) : (
            <h2 ref={headlineRef} className={styles.headline}>{t('headline')}</h2>
          )}
          <div ref={taglineRef} className={styles.tagline}>
            {taglineParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Form */}
        <form
            ref={formRef}
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              if (isPending) return;
              const fd = new FormData(e.currentTarget);
              const payload = {
                name:       String(fd.get('name')       ?? '').trim(),
                email:      String(fd.get('email')      ?? '').trim(),
                lookingFor: String(fd.get('lookingFor') ?? '').trim(),
                message:    String(fd.get('message')    ?? '').trim(),
              };
              const form = e.currentTarget;
              startTransition(async () => {
                try {
                  const res = await fetch('/api/contact', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload),
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok || !json.ok) {
                    setSubmitState('error');
                    setSubmitMsg(
                      res.status === 429
                        ? 'Too many requests — try again in a minute.'
                        : json?.error === 'VALIDATION_FAILED'
                          ? 'Please check the fields and try again.'
                          : 'Sorry, something went wrong. Please try again.',
                    );
                    return;
                  }
                  setSubmitState('success');
                  setSubmitMsg('Message sent. We’ll reply within 1–2 business days.');
                  form.reset();
                } catch {
                  setSubmitState('error');
                  setSubmitMsg('Network error — please try again.');
                }
              });
            }}
          >

            <div className={styles.formRow}>
              <input
                name="name"
                type="text"
                className={styles.input}
                placeholder="Your name"
                aria-label="Your name"
                autoComplete="name"
                required
                disabled={isPending}
              />
              <input
                name="email"
                type="email"
                className={styles.input}
                placeholder="Email address"
                aria-label="Email address"
                autoComplete="email"
                required
                disabled={isPending}
              />
            </div>

            <div className={styles.selectWrapper}>
              <select name="lookingFor" className={styles.select} aria-label={t('lookingFor')} defaultValue="" required disabled={isPending}>
                <option value="" disabled>{t('lookingFor')}</option>
                {CONTACT.needs.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <textarea
              name="message"
              className={styles.textarea}
              placeholder="Tell us about your project..."
              aria-label="Your message"
              rows={3}
              required
              disabled={isPending}
            />

            <label className={styles.consentLabel}>
              <input type="checkbox" className={styles.consentCheckbox} required disabled={isPending} />
              <span className={styles.consentText}>
                I consent to the use of my data for this inquiry only.
              </span>
            </label>

            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? t('sending') : t('send')}
            </button>

            {submitState !== 'idle' && (
              <p
                role={submitState === 'error' ? 'alert' : 'status'}
                className={styles.submitFeedback}
                data-state={submitState}
              >
                {submitMsg}
              </p>
            )}

        </form>

        {/* Social row — icon + label, centred with divider */}
        <div className={styles.socialRow}>
          {socials.map((s, i) => (
            <span key={s.label} className={styles.socialItem}>
              {i > 0 && <span className={styles.socialSep} aria-hidden="true">|</span>}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label={s.label}
              >
                <SocialGlyph label={s.label} />
                <span className={styles.socialLabel}>{s.label}</span>
              </a>
            </span>
          ))}
        </div>

        {/* Coconut counter */}
        <div ref={statRef} className={styles.stat}>
          <img ref={iconRef} src="/coconut.svg" alt="" className={styles.statIcon} />
          <span ref={numRef} className={styles.statNumber}>0</span>
          <span className={styles.statLabel}>{t('coconutsLabel')}</span>
        </div>

      </div>

      {/* Cookie + copyright — pinned to the very bottom of the section.
          Kept OUTSIDE .inner so .inner's transform can't become its containing
          block (which would drag it up onto the coconut). */}
      <div className={styles.rightMeta}>
        <a href="/cookie-policy" className={styles.metaLink}>Cookie Policy</a>
        <span className={styles.metaSep}>·</span>
        <span className={styles.metaCopyright}>© {year} Muem Studio</span>
        <span id="footer-cta" className={styles.footerCtaTarget} aria-hidden="true" />
      </div>

      {/* Invisible anchor — triggers FloatingCTA snap on scroll ─────── */}
      <div id="footer-marker" className={styles.footerAnchor} aria-hidden="true" />

    </section>
  );
}
