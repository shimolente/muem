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

      // Scroll arrow: fade in then bounce continuously
      gsap.fromTo(
        scrollIndRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.2,
          onComplete: () => {
            gsap.to(scrollIndRef.current, {
              y: 7,
              duration: 0.9,
              ease: 'power1.inOut',
              repeat: -1,
              yoyo: true,
            });
          },
        },
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

        {/* Small label above headline */}
        {HERO.label && (
          <p className={styles.label}>{HERO.label}</p>
        )}

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

      {/* Scroll arrow — bounces to invite scroll, no text */}
      <div ref={scrollIndRef} className={styles.scrollIndicator} aria-label="Scroll down">
        <svg
          className={styles.scrollArrow}
          width="20" height="20" viewBox="0 0 20 20"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 4v12M4 10l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
