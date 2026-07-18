'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import type { FeaturedCategory } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import { prefersReducedMotion } from '@/lib/animation';
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
  const [activePage, setActivePage] = useState(0); // mobile carousel page (for the fixed dot strip)
  const isAnimating               = useRef(false);
  const catIdxRef             = useRef(0);   // mirrors catIdx — avoids stale closure in autoplay
  const autoTimerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRefs              = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef            = useRef<HTMLElement>(null);
  const carouselRef           = useRef<HTMLDivElement>(null);
  const mobileFirstPageRef    = useRef<HTMLDivElement>(null);
  const mobileDotsRef         = useRef<HTMLDivElement>(null);

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

  /* ── Mobile entrance — first carousel page: cards enter rounded→sharp
        (staggered), the category strip + dots slide in. Plays once when the
        section enters view. Desktop bento owns its own reveal above. ────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    if (prefersReducedMotion()) return;
    const el = sectionRef.current;
    if (!el) return;

    const page  = mobileFirstPageRef.current;
    const cards = page ? Array.from(page.querySelectorAll<HTMLElement>(`.${styles.mobileCard}`)) : [];
    const strip = page ? [
      page.querySelector<HTMLElement>(`.${styles.mobileStripLabel}`),
      page.querySelector<HTMLElement>(`.${styles.mobileStripTitle}`),
    ].filter((el): el is HTMLElement => Boolean(el)) : [];
    const dots  = mobileDotsRef.current;

    if (cards.length) gsap.set(cards, { opacity: 0, y: 40, borderRadius: 40 });
    if (strip.length) gsap.set(strip, { opacity: 0, y: 16 });
    if (dots)  gsap.set(dots,  { opacity: 0, y: 12 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (cards.length) gsap.to(cards, {
          opacity: 1, y: 0, borderRadius: 0,
          stagger: 0.1, duration: 0.8, ease: 'power3.out',
        });
        if (strip.length) gsap.to(strip, {
          opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out', delay: 0.25,
        });
        if (dots)  gsap.to(dots,  { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.5 });
        obs.disconnect();
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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

  const scrollToPage = (i: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.clientWidth;
    // A clone of page 0 sits after the last real page. Once the swipe settles on
    // it, jump instantly back to real page 0 → seamless loop (3rd → 1st).
    if (el.scrollLeft >= FEATURED.length * w - 2) {
      el.scrollLeft = 0;
      setActivePage(0);
      return;
    }
    setActivePage(Math.round(el.scrollLeft / w) % FEATURED.length);
  };

  return (
    <section ref={sectionRef} data-snap-section="featured" className={styles.section}>

      {/* ── Mobile-only: full-height swipe carousel — boxes + title swipe; the
           dot strip below is a FIXED overlay that only updates its active dot.
           A trailing clone of page 0 makes the swipe loop 3rd → 1st. ───────── */}
      <div ref={carouselRef} className={styles.mobileBento} onScroll={onCarouselScroll}>
        {[...FEATURED, FEATURED[0]].map((c, i) => {
          const realIdx      = i % FEATURED.length;
          const variant      = realIdx >= 2 ? 2 : realIdx; // 0: 1+2 · 1: 2+1 · 2: 2+2
          const topIsPair    = variant !== 0;
          const bottomIsPair = variant !== 1;
          const topCount     = topIsPair ? 2 : 1;
          const projs        = c.projects;
          const topImages    = projs.slice(0, topCount).filter(Boolean);
          const bottomImages = projs.slice(topCount, topCount + (bottomIsPair ? 2 : 1)).filter(Boolean);
          return (
            <div key={i} ref={i === 0 ? mobileFirstPageRef : undefined} className={styles.mobilePage}>
              <div className={`${styles.mobileBentoRow} ${topIsPair ? styles.mobileBentoPair : styles.mobileBentoWide}`}>
                {topImages.map(p => (
                  <a key={p.id} href={p.href}
                     className={`${styles.mobileCard} ${topIsPair ? styles.mobileCardSquare : styles.mobileCardWide}`}
                     style={{ backgroundImage: p.imageSrc ? `url(${p.imageSrc})` : undefined }}
                     aria-label={`${p.title} — ${p.location}`}>
                    <div className={styles.mobileCardOverlay} />
                    <div className={styles.mobileCardMeta}>
                      <span className={styles.mobileCardLocation}>{p.location}</span>
                      <span className={styles.mobileCardTitle}>{p.title}</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className={styles.mobileStrip}>
                <span className={styles.mobileStripLabel}>{tLabel()}</span>
                <span className={styles.mobileStripTitle}>{tName(c.id, c.name)}</span>
              </div>

              <div className={`${styles.mobileBentoRow} ${bottomIsPair ? styles.mobileBentoPair : styles.mobileBentoWide}`}>
                {bottomImages.map(p => (
                  <a key={p.id} href={p.href}
                     className={`${styles.mobileCard} ${bottomIsPair ? styles.mobileCardSquare : styles.mobileCardWide}`}
                     style={{ backgroundImage: p.imageSrc ? `url(${p.imageSrc})` : undefined }}
                     aria-label={`${p.title} — ${p.location}`}>
                    <div className={styles.mobileCardOverlay} />
                    <div className={styles.mobileCardMeta}>
                      <span className={styles.mobileCardLocation}>{p.location}</span>
                      <span className={styles.mobileCardTitle}>{p.title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed dot strip — stays put while pages swipe; only the active dot moves */}
      <div ref={mobileDotsRef} className={styles.mobileDotsFixed} role="tablist" aria-label="Browse categories">
        {FEATURED.map((c, i) => (
          <button key={c.id} type="button" role="tab" aria-selected={i === activePage}
            aria-label={`Show ${tName(c.id, c.name)}`}
            className={`${styles.mobileDotFixed} ${i === activePage ? styles.mobileDotFixedActive : ''}`}
            onClick={() => scrollToPage(i)} />
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
