'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { FEATURED } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import styles from './FeaturedSection.module.css';

const AUTOPLAY_MS = 9000;

// Four cardinal directions — no diagonals.
const DIRS_POOL: { x: string | number; y: string | number }[] = [
  { x: '-100%', y: 0 },
  { x: '100%',  y: 0 },
  { x: 0, y: '-100%' },
  { x: 0, y:  '100%' },
];

function getRandomDirs(count: number) {
  return Array.from({ length: count }, () => DIRS_POOL[Math.floor(Math.random() * DIRS_POOL.length)]);
}

export function FeaturedSection() {
  const [catIdx, setCatIdx]       = useState(0);
  const [display, setDisplay]     = useState(0); // rendered data — lags catIdx during exit transition
  const [, setMobileIdx] = useState(0);
  const mobileScrollerRef         = useRef<HTMLDivElement>(null);
  const isAnimating               = useRef(false);
  const catIdxRef             = useRef(0);   // mirrors catIdx — avoids stale closure in autoplay
  const autoTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs              = useRef<(HTMLDivElement | null)[]>([]);
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

    // Exit: cards fade out, text fades out
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

    // Set each card to a random directional start position
    const initDirs = getRandomDirs(cards.length);
    cards.forEach((card, i) => {
      const d = initDirs[i] ?? { x: 0, y: 20 };
      gsap.set(card, { x: d.x, y: d.y });
    });
    gsap.set(textEls, { opacity: 0, y: 14 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;
          // Cards slide completely in from outside their cell frame
          gsap.to(cards, {
            x: 0, y: 0, opacity: 1,
            stagger: 0.09, duration: 0.85, ease: 'power3.out', delay: 0.1,
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

    const isFirstVisit = !seenCategoriesRef.current.has(display);

    if (isFirstVisit) {
      // Mark seen before animating so rapid tab clicks don't re-trigger
      seenCategoriesRef.current.add(display);
      // Directional entrance — random cardinal directions per card
      const dirs = getRandomDirs(cards.length);
      cards.forEach((card, i) => {
        const d = dirs[i] ?? { x: 0, y: 20 };
        gsap.set(card, { x: d.x, y: d.y });
      });
      gsap.to(cards, {
        x: 0, y: 0, opacity: 1,
        stagger: 0.09, duration: 0.85, ease: 'power3.out',
        onComplete: () => { isAnimating.current = false; },
      });
    } else {
      // Subsequent visits — partial slide in with fade
      gsap.fromTo(
        cards,
        { y: '40%', opacity: 0 },
        {
          y: 0, opacity: 1,
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

      {/* ── Mobile-only: horizontal scroll-snap between categories ────── */}
      <div
        ref={mobileScrollerRef}
        className={styles.mobileScroller}
        aria-hidden="true"
        onScroll={() => {
          const el = mobileScrollerRef.current;
          if (el) setMobileIdx(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {FEATURED.map((c, ci) => (
          <div key={c.id} className={styles.mobileCategory}>
            <div className={styles.mobileCards}>
              {c.projects.slice(0, 2).map(p => (
                <a key={p.id} href={p.href} className={styles.mobileCard}
                   style={{ backgroundImage: `url(${p.imageSrc})` }}
                   aria-label={`${p.title} — ${p.location}`}>
                  <div className={styles.mobileCardOverlay} />
                  <span className={styles.mobileCardTitle}>{p.title}</span>
                </a>
              ))}
            </div>

            <div className={styles.mobileMiddle}>
              <span className={styles.mobileLabel}>{c.label}</span>
              <h2 className={styles.mobileTitle}>{c.name}</h2>
              <div className={styles.mobileDots} aria-hidden="true">
                {FEATURED.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.mobileDot} ${i === ci ? styles.mobileDotActive : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className={styles.mobileCards}>
              {c.projects.slice(2, 4).map(p => (
                <a key={p.id} href={p.href} className={styles.mobileCard}
                   style={{ backgroundImage: `url(${p.imageSrc})` }}
                   aria-label={`${p.title} — ${p.location}`}>
                  <div className={styles.mobileCardOverlay} />
                  <span className={styles.mobileCardTitle}>{p.title}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.grid} ${cat.id === 'studio' ? styles.gridStudio : cat.id === 'habitus' ? styles.gridHabitus : cat.id === 'residences' ? styles.gridResidences : ''}`}>

        {/* ── Image cards — count driven by cat.projects ──────────── */}
        {cat.projects.map((project, i) => {
          const slot = String.fromCharCode(65 + i); // 'A', 'B', 'C', …
          return (
            <a
              key={`${display}-${slot}`}
              href={project.href}
              className={`${styles.cell} ${styles[`cell${slot}`]}`}
              aria-label={`${project.title} — ${project.location}`}
            >
              {/* cellInner is the GSAP target — slides within the clipped cell frame */}
              <div
                ref={el => { cardRefs.current[i] = el; }}
                className={styles.cellInner}
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
