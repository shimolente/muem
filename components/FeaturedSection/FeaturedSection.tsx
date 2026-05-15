'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import type { FeaturedCategory } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import styles from './FeaturedSection.module.css';

// Category id (from query) → tab-name translation key.
const FEATURED_NAME_KEY: Record<string, string> = {
  studio:     'studioName',
  habitus:    'habitusName',
  residences: 'residencesName',
};

const CARD_RADIUS = 80;

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

export function FeaturedSection({ categories: FEATURED }: { categories: FeaturedCategory[] }) {
  const t = useTranslations('featured');
  const tName = (id: string, fallback: string) => {
    const k = FEATURED_NAME_KEY[id];
    return k ? t(k) : fallback;
  };
  const tLabel = () => t('label');
  const [catIdx, setCatIdx]       = useState(0);
  const [display, setDisplay]     = useState(0); // rendered data — lags catIdx during exit transition
  const [, setMobileIdx] = useState(0);
  const mobileScrollerRef         = useRef<HTMLDivElement>(null);
  const isAnimating               = useRef(false);
  const catIdxRef             = useRef(0);   // mirrors catIdx — avoids stale closure in autoplay
  const autoTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs              = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef            = useRef<HTMLElement>(null);

  // Text cell element refs — animated independently of cards
  const textLabelRef = useRef<HTMLSpanElement>(null);
  const textTitleRef = useRef<HTMLHeadingElement>(null);

  const setNavTheme   = useUIStore(s => s.setNavTheme);
  const setNavStyle   = useUIStore(s => s.setNavStyle);
  const setNavLogoSrc = useUIStore(s => s.setNavLogoSrc);

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
          scheduleNavUpdate(() => {
            // Light nav = white hamburger — readable over the dark card images
            setNavTheme('light');
            setNavStyle('minimal');
            setNavLogoSrc('/logo-and-brandbook/word-only.svg');
          });
        }
        // No else — sections 1 & 2 own the 'full' reset when they re-enter
      },
      { threshold: 0.1 }, // low — fires early so section 4 wins over any scroll-through of sections 1-2
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavLogoSrc]);

  /* ── Entrance animation — fires every time the section enters viewport.
        On leave, cards + text are reset to their off-screen start state so
        the next entry replays cleanly. ─────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const resetCards = () => {
      const cards = cardRefs.current.filter(Boolean);
      const dirs = getRandomDirs(cards.length);
      cards.forEach((card, i) => {
        const d = dirs[i] ?? { x: 0, y: 20 };
        // Round the cellInner (the card). The outer .cell is the frame —
        // it stays sharp. cellInner has overflow:hidden so its rounded
        // shape clips the image inside.
        gsap.set(card, { x: d.x, y: d.y, opacity: 1, borderRadius: CARD_RADIUS });
      });
      const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);
      gsap.set(textEls, { opacity: 0, y: 14 });
    };

    resetCards();

    const obs = new IntersectionObserver(
      ([entry]) => {
        const cards   = cardRefs.current.filter(Boolean);
        const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);

        if (entry.isIntersecting) {
          gsap.killTweensOf(cards);
          gsap.killTweensOf(textEls);
          gsap.to(cards, {
            x: 0, y: 0, opacity: 1, borderRadius: 0,
            stagger: 0.09, duration: 0.85, ease: 'power3.out', delay: 0.1,
            onComplete: () => startAutoplay(),
          });
          gsap.to(textEls, {
            opacity: 1, y: 0,
            stagger: 0.12, duration: 0.7, ease: 'power3.out', delay: 0.35,
          });
        } else {
          gsap.killTweensOf(cards);
          gsap.killTweensOf(textEls);
          if (autoTimerRef.current) {
            clearInterval(autoTimerRef.current);
            autoTimerRef.current = null;
          }
          resetCards();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startAutoplay]);

  /* ── Stagger back in whenever displayed category changes ─────────── */
  useEffect(() => {
    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);

    // Directional entrance — random cardinal directions per card, rounded → sharp
    const dirs = getRandomDirs(cards.length);
    cards.forEach((card, i) => {
      const d = dirs[i] ?? { x: 0, y: 20 };
      gsap.set(card, { x: d.x, y: d.y, opacity: 1, borderRadius: CARD_RADIUS });
    });

    gsap.to(cards, {
      x: 0, y: 0, opacity: 1, borderRadius: 0,
      stagger: 0.09, duration: 0.85, ease: 'power3.out',
      onComplete: () => { isAnimating.current = false; },
    });

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
              <span className={styles.mobileLabel}>{tLabel()}</span>
              <h2 className={styles.mobileTitle}>{tName(c.id, c.name)}</h2>
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
          <span ref={textLabelRef} className={styles.textLabel}>{tLabel()}</span>
          <Link
            href={`/studio?category=${encodeURIComponent(cat.name)}`}
            className={styles.textTitleLink}
            aria-label={`See all ${tName(cat.id, cat.name)} projects`}
          >
            <h2 ref={textTitleRef} className={styles.textTitle}>{tName(cat.id, cat.name)}</h2>
          </Link>

          <div className={styles.dots} role="tablist" aria-label="Browse categories">
            {FEATURED.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={i === catIdx}
                aria-label={`Show ${tName(c.id, c.name)}`}
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
