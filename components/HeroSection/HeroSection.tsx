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
  const sectionRef   = useRef<HTMLElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

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
      // Word reveal on load
      const words = headlineRef.current?.querySelectorAll('[data-word]') ?? [];
      gsap.fromTo(
        words,
        { y: '110%', opacity: 0 },
        { y: '0%', opacity: 1, stagger: 0.1, duration: 1.1, ease: 'power3.out', delay: 0.2 },
      );

      // Scroll indicator fade in
      gsap.fromTo(
        scrollIndRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.1 },
      );
    }, sectionRef);

    // Fade out scroll indicator once the user scrolls away from hero
    const observer = new IntersectionObserver(
      ([entry]) => {
        gsap.to(scrollIndRef.current, {
          opacity: entry.isIntersecting ? 1 : 0,
          y: entry.isIntersecting ? 0 : -12,
          duration: 0.4,
          ease: 'power2.out',
        });
      },
      { threshold: 0.5 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, []);

  const words = HERO.headline.split(' ');

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="hero">
      <div className={styles.content}>
        <h1 ref={headlineRef} className={styles.headline}>
          {words.map((word, i) => (
            <span key={i} className={styles.wordClip}>
              <span data-word style={{ display: 'inline-block' }}>
                {word}{i < words.length - 1 ? '\u00A0' : ''}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div ref={scrollIndRef} className={styles.scrollIndicator} aria-label="Scroll down">
        <span className={styles.scrollLabel}>{HERO.scrollLabel}</span>
        <div className={styles.scrollLine}>
          <div className={styles.scrollLineFill} />
        </div>
      </div>
    </section>
  );
}
