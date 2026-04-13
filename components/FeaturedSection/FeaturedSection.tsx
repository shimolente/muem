'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { FEATURED } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import styles from './FeaturedSection.module.css';

const AUTOPLAY_MS = 9000;

export function FeaturedSection() {
  const [catIdx, setCatIdx]   = useState(0);
  const [display, setDisplay] = useState(0); // rendered data — lags catIdx during exit transition
  const isAnimating           = useRef(false);
  const catIdxRef             = useRef(0);   // mirrors catIdx — avoids stale closure in autoplay
  const autoTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs              = useRef<(HTMLAnchorElement | null)[]>([]);
  const sectionRef            = useRef<HTMLElement>(null);
  const hasEntered            = useRef(false);

  // Text cell element refs — animated independently of cards
  const textLabelRef = useRef<HTMLSpanElement>(null);
  const textTitleRef = useRef<HTMLHeadingElement>(null);

  const setNavTheme  = useUIStore(s => s.setNavTheme);
  const setNavStyle  = useUIStore(s => s.setNavStyle);

  /* ── Category switch — reads catIdxRef, no stale closure ─────────── */
  const switchCategory = useCallback((idx: number) => {
    if (idx === catIdxRef.current || isAnimating.current) return;
    isAnimating.current = true;
    catIdxRef.current = idx;

    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);

    // Exit: cards stagger up, text fades out simultaneously
    gsap.to(cards, {
      opacity: 0, y: -12, stagger: 0.04, duration: 0.28, ease: 'power2.in',
      onComplete: () => {
        setDisplay(idx);
        setCatIdx(idx);
      },
    });
    gsap.to(textEls, { opacity: 0, y: -6, duration: 0.2, stagger: 0.03, ease: 'power2.in' });
  }, []);

  /* ── Autoplay — advances every AUTOPLAY_MS, loops back to 0 ─────── */
  const startAutoplay = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      const next = (catIdxRef.current + 1) % FEATURED.length;
      switchCategory(next);
    }, AUTOPLAY_MS);
  }, [switchCategory]);

  // Clean up interval on unmount
  useEffect(() => () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  /* ── Nav theming ─────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Light nav = white hamburger — readable over the dark card images
          setNavTheme('light');
          setNavStyle('minimal');
        }
        // No else — sections 1 & 2 own the 'full' reset when they re-enter
      },
      { threshold: 0.1 }, // low — fires early so section 4 wins over any scroll-through of sections 1-2
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle]);

  /* ── Entrance animation (fires once on first intersection) ───────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);
    gsap.set(cards,   { opacity: 0, y: 18 });
    gsap.set(textEls, { opacity: 0, y: 14 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;
          // Cards stagger in
          gsap.to(cards, {
            opacity: 1, y: 0,
            stagger: 0.07, duration: 0.85, ease: 'power3.out', delay: 0.1,
            onComplete: () => startAutoplay(),
          });
          // Text hierarchy: label → title → tagline, each with a beat
          gsap.to(textEls, {
            opacity: 1, y: 0,
            stagger: 0.12, duration: 0.7, ease: 'power3.out', delay: 0.35,
          });
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startAutoplay]);

  /* ── Stagger back in whenever displayed category changes ─────────── */
  useEffect(() => {
    if (!hasEntered.current) return; // skip until entrance animation has run

    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);

    // Cards cascade in
    gsap.fromTo(
      cards,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0,
        stagger: 0.06, duration: 0.65, ease: 'power3.out',
        onComplete: () => { isAnimating.current = false; },
      },
    );
    // Text hierarchy stagger in — slight delay so cards lead
    gsap.fromTo(
      textEls,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'power3.out', delay: 0.15 },
    );
  }, [display]);

  const cat = FEATURED[display];

  return (
    <section ref={sectionRef} data-snap-section="featured" className={styles.section}>
      <div className={`${styles.grid} ${cat.id === 'studio' ? styles.gridStudio : cat.id === 'habitus' ? styles.gridHabitus : cat.id === 'residences' ? styles.gridResidences : ''}`}>

        {/* ── Image cards — count driven by cat.projects ──────────── */}
        {cat.projects.map((project, i) => {
          const slot = String.fromCharCode(65 + i); // 'A', 'B', 'C', …
          return (
            <a
              key={`${display}-${slot}`}
              href={project.href}
              ref={el => { cardRefs.current[i] = el; }}
              className={`${styles.cell} ${styles[`cell${slot}`]}`}
              aria-label={`${project.title} — ${project.location}`}
            >
              <div
                className={styles.cellImage}
                style={{ backgroundImage: project.imageSrc ? `url(${project.imageSrc})` : undefined }}
              />
              <div className={styles.cellOverlay} />
              <div className={styles.cellMeta}>
                <span className={styles.cellLocation}>{project.location}</span>
                <span className={styles.cellTitle}>{project.title}</span>
              </div>
            </a>
          );
        })}

        {/* ── Centre text cell ─────────────────────────────────────── */}
        <div className={styles.textCell}>
          <span ref={textLabelRef} className={styles.textLabel}>{cat.label}</span>
          <h2   ref={textTitleRef}   className={styles.textTitle}>{cat.name}</h2>

          <div className={styles.dots} role="tablist" aria-label="Browse categories">
            {FEATURED.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={i === catIdx}
                aria-label={`Show ${c.name}`}
                className={`${styles.dot} ${i === catIdx ? styles.dotActive : ''}`}
                onClick={() => { switchCategory(i); startAutoplay(); }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
