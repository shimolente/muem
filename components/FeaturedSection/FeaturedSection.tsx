'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { FEATURED } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import styles from './FeaturedSection.module.css';

const AUTOPLAY_MS = 9000;

// Per-card directional offsets keyed by category id.
// Each entry maps to the visual grid slots (A, B, C…) in order.
const DIRS_BY_CAT: Record<string, { x: number; y: number }[]> = {
  // Studio: gridStudio — "a a b b c d / a a t t c i / e e f g h h"
  studio: [
    { x: -90, y:   0 },  // A — left tall
    { x:   0, y: -80 },  // B — top center
    { x:  80, y:   0 },  // C — right mid
    { x:  80, y: -40 },  // D — top-right corner
    { x: -60, y:  70 },  // E — bottom-left
    { x:   0, y:  80 },  // F — bottom center-left
    { x:   0, y:  80 },  // G — bottom center-right
    { x:  60, y:  70 },  // H — bottom-right
    { x:  80, y:   0 },  // I — mid-right
  ],
  // Habitus: gridHabitus — "a a b c d d / e f t t h h / e i g g h h"
  habitus: [
    { x: -80, y: -60 },  // A — top-left
    { x:   0, y: -80 },  // B — top center-left
    { x:   0, y: -80 },  // C — top center-right
    { x:  80, y: -60 },  // D — top-right
    { x: -90, y:   0 },  // E — left tall
    { x: -60, y:  20 },  // F — mid-left
    { x:   0, y:  80 },  // G — bottom center
    { x:  90, y:   0 },  // H — right tall
    { x: -50, y:  70 },  // I — bottom-left
  ],
  // Residences: gridResidences — "a a b b c c / a a t t d g / e e e f f f"
  residences: [
    { x: -90, y:   0 },  // A — left tall
    { x:   0, y: -80 },  // B — top center-left
    { x:  80, y: -60 },  // C — top-right
    { x:  90, y:   0 },  // D — mid-right
    { x: -60, y:  80 },  // E — bottom-left wide
    { x:  60, y:  80 },  // F — bottom-right wide
    { x:  90, y:  30 },  // G — mid-far-right
  ],
};

export function FeaturedSection() {
  const [catIdx, setCatIdx]   = useState(0);
  const [display, setDisplay] = useState(0); // rendered data — lags catIdx during exit transition
  const isAnimating           = useRef(false);
  const catIdxRef             = useRef(0);   // mirrors catIdx — avoids stale closure in autoplay
  const autoTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs              = useRef<(HTMLAnchorElement | null)[]>([]);
  const sectionRef            = useRef<HTMLElement>(null);
  const hasEntered            = useRef(false);
  // Track which category indices have had their first-visit directional entrance.
  // Studio (0) is pre-marked — it's handled by the section entrance animation.
  const seenCategoriesRef     = useRef<Set<number>>(new Set([0]));

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

    // Set each card to its directional start position (Studio dirs — initial category)
    const initDirs = DIRS_BY_CAT['studio'] ?? [];
    cards.forEach((card, i) => {
      const d = initDirs[i] ?? { x: 0, y: 20 };
      gsap.set(card, { opacity: 0, x: d.x, y: d.y });
    });
    gsap.set(textEls, { opacity: 0, y: 14 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;
          // Cards slide in from their directional offset, staggered
          gsap.to(cards, {
            opacity: 1, x: 0, y: 0,
            stagger: 0.09, duration: 0.9, ease: 'power3.out', delay: 0.1,
            onComplete: () => startAutoplay(),
          });
          // Text: label → title, slight delay so cards lead
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

    const catId        = FEATURED[display].id;
    const isFirstVisit = !seenCategoriesRef.current.has(display);

    if (isFirstVisit) {
      // Mark seen before animating so rapid tab clicks don't re-trigger
      seenCategoriesRef.current.add(display);
      // Directional entrance — each card slides in from its grid-position edge
      const dirs = DIRS_BY_CAT[catId] ?? [];
      cards.forEach((card, i) => {
        const d = dirs[i] ?? { x: 0, y: 20 };
        gsap.set(card, { opacity: 0, x: d.x, y: d.y });
      });
      gsap.to(cards, {
        opacity: 1, x: 0, y: 0,
        stagger: 0.09, duration: 0.9, ease: 'power3.out',
        onComplete: () => { isAnimating.current = false; },
      });
    } else {
      // Subsequent visits — simple cascade in from slight offset below
      gsap.fromTo(
        cards,
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0,
          stagger: 0.06, duration: 0.65, ease: 'power3.out',
          onComplete: () => { isAnimating.current = false; },
        },
      );
    }

    // Text always does the same gentle stagger in
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
