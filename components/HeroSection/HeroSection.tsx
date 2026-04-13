'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HERO } from '@/content/hero';
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

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);
  const setNavBg    = useUIStore(s => s.setNavBg);

  /* ── Nav: full links while hero is visible ─────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light'); // white bars over dark video
          setNavStyle('full');
          setNavBg('transparent'); // homepage hero: no fill over video
        }
      },
      { threshold: 0.85 }, // high threshold — only fires when truly settled here, not during scroll-through
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg]);

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

  const words = HERO.headline.split(' ');

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="hero">

      <div className={styles.headlineWrap}>
        {/* Big headline */}
        <h1 ref={headlineRef} className={styles.headline}>
          {words.map((word, i) => {
            const isItalic = word.replace(/[^a-zA-Z]/g, '') === 'Luxury';
            return (
              <span key={i} className={styles.wordClip}>
                <span
                  data-word
                  style={{
                    display: 'inline-block',
                    fontFamily: isItalic ? 'var(--font-display-italic)' : undefined,
                  }}
                >
                  {word}{i < words.length - 1 ? '\u00A0' : ''}
                </span>
              </span>
            );
          })}
        </h1>

        {/* Small caption below */}
        {HERO.label && (
          <p ref={labelRef} className={styles.label}>{HERO.label}</p>
        )}
      </div>

    </section>
  );
}
