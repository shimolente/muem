'use client';

import { useRef, useEffect, useState, useTransition } from 'react';
import gsap from 'gsap';
import { CONTACT } from '@/content/contact';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import { useTranslations } from 'next-intl';
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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
      <path d="M9 10a0.5 .5 0 0 0 1 0v-1a0.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a0.5 .5 0 0 0 0 -1h-1a0.5 .5 0 0 0 0 1" />
    </svg>
  );
}

interface ContactSectionProps {
  isPage?: boolean;
}

export function ContactSection({ isPage = false }: ContactSectionProps) {
  const t = useTranslations('contact');
  const sectionRef  = useRef<HTMLElement>(null);
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
        gsap.set(iconRef.current, { opacity: 0, y: isDesktop ? -44 : 0 });
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
      { threshold: 0.2 },
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
            <span ref={labelRef} className={styles.sectionLabel}>{t('label')}</span>

            {/* Row 2 — headline, dead centre */}
            <h2 ref={headlineRef} className={styles.headline}>{t('headline')}</h2>

            {/* Row 3 — tagline, aligned to top of row */}
            <div ref={taglineRef} className={styles.tagline}>
              {taglineParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Stat — pinned to bottom via absolute */}
            <div ref={statRef} className={styles.stat}>
              <div className={styles.statNumberRow}>
                <span ref={numRef} className={styles.statNumber}>0</span>
                <img ref={iconRef} src="/coconut.svg" alt="" className={styles.statIcon} />
              </div>
              <span className={styles.statLabel}>{t('coconutsLabel')}</span>
            </div>

          </div>
        </div>

        {/* Right: form */}
        <div className={styles.rightPanel}>
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

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <input
                name="name"
                type="text"
                className={styles.input}
                placeholder="Your name"
                autoComplete="name"
                required
                disabled={isPending}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <input
                name="email"
                type="email"
                className={styles.input}
                placeholder="Your email address"
                autoComplete="email"
                required
                disabled={isPending}
              />
            </div>


            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <div className={styles.selectWrapper}>
                <select name="lookingFor" className={styles.select} defaultValue="" required disabled={isPending}>
                  <option value="" disabled>{t('lookingFor')}</option>
                  {CONTACT.needs.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}></label>
              <textarea
                name="message"
                className={styles.textarea}
                placeholder="Tell us about your project..."
                rows={3}
                required
                disabled={isPending}
              />
            </div>

            <label className={styles.consentLabel}>
              <input type="checkbox" className={styles.consentCheckbox} required disabled={isPending} />
              <span className={styles.consentText}>
                I consent to my data being stored to process this inquiry. It will not be used for commercial purposes.
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
