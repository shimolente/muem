'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui';
import styles from './HeroSection.module.css';

/**
 * Snap section 1 — headline + scroll indicator.
 * Video background is handled by <HeroBackground /> (fixed, outside this component).
 */
export function HeroSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const labelRef    = useRef<HTMLParagraphElement>(null);

  const t = useTranslations('hero');

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavBg             = useUIStore(s => s.setNavBg);
  const setFloatingArrowHide = useUIStore(s => s.setFloatingArrowHide);
  const setNavLogoSrc        = useUIStore(s => s.setNavLogoSrc);

  /* ── Nav: full links while hero is visible. Also suppress the floating
        ↓ — the hero already shows its own arrow at the bottom. ────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light'); // white bars over dark video
          setNavStyle('full');
          setNavBg('transparent'); // homepage hero: no fill over video
          setFloatingArrowHide(true);
          setNavLogoSrc(null); // hero shows the mark, not the wordmark
        }
      },
      { threshold: 0.85 }, // high threshold — only fires when truly settled here, not during scroll-through
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg, setFloatingArrowHide, setNavLogoSrc]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label slides in first
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 },
      );

      // Word reveal follows
      const words = headlineRef.current?.querySelectorAll('[data-word]') ?? [];
      gsap.fromTo(
        words,
        { y: '110%', opacity: 0 },
        { y: '0%', opacity: 1, stagger: 0.1, duration: 1.1, ease: 'power3.out', delay: 0.4 },
      );

    }, sectionRef);

    return () => { ctx.revert(); };
  }, []);

  const headline = t('headline');
  const label    = t('label');
  const words    = headline.split(' ');

  const handleArrow = () => {
    const about = document.querySelector<HTMLElement>('[data-snap-section="about"]');
    about?.scrollIntoView({ block: 'start' });
  };

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="hero">

      <div className={styles.headlineWrap}>
        {/* Big headline */}
        <h1 ref={headlineRef} className={styles.headline}>
          {words.map((word, i) => {
            const clean = word.replace(/[^a-zA-ZáéíóúñÑ]/g, '').toLowerCase();
            const isItalic = clean === 'luxury' || clean === 'lujo';
            return (
              <span key={i} className={styles.wordClip}>
                <span
                  data-word
                  style={{
                    display: 'inline-block',
                    fontFamily: isItalic ? 'var(--font-display-italic)' : undefined,
                    color:      isItalic ? '#F4F3EF' : undefined,
                  }}
                >
                  {word}{i < words.length - 1 ? '\u00A0\u00A0' : ''}
                </span>
              </span>
            );
          })}
        </h1>

        {/* Small caption below */}
        {label && (
          <p ref={labelRef} className={styles.label}>{label}</p>
        )}
      </div>

      <button
        type="button"
        className={styles.arrow}
        onClick={handleArrow}
        aria-label="Scroll to next section"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.arrowIcon}
        >
          <line x1="12" y1="4" x2="12" y2="20" />
          <polyline points="6 14 12 20 18 14" />
        </svg>
      </button>

    </section>
  );
}
