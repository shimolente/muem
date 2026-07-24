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

// Mobile: three bento rows per category page. Numbers are cards-per-row
// (1 = wide, 2 = square pair). Rhythm differs per category so adjacent pages
// don't repeat. Index = category order (0 Residential · 1 Hospitality · 2 Commercial).
const MOBILE_ROW_LAYOUTS: number[][] = [
  [1, 2, 1], // Residential
  [2, 1, 2], // Hospitality
  [1, 1, 2], // Commercial
];

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
  const isAutoScrollingRef    = useRef(false);

  // Text cell element refs — animated independently of cards
  const textLabelRef = useRef<HTMLSpanElement>(null);
  const textTitleRef = useRef<HTMLHeadingElement>(null);

  const setNavTheme   = useUIStore(s => s.setNavTheme);
  const setNavStyle   = useUIStore(s => s.setNavStyle);
  const setNavLogoSrc = useUIStore(s => s.setNavLogoSrc);

  /* ── Category switch — reads catIdxRef, no stale closure ─────────── */
  // lastCatDirRef carries the travel direction to the [display] slide-in
  // effect below, so the whole category swaps as one continuous slide.
  const lastCatDirRef = useRef<1 | -1>(1);

  const switchCategory = useCallback((idx: number, forcedDir?: 1 | -1) => {
    if (idx === catIdxRef.current || isAnimating.current) return;
    isAnimating.current = true;
    const dir = forcedDir ?? (idx > catIdxRef.current ? 1 : -1);
    lastCatDirRef.current = dir;
    catIdxRef.current = idx;

    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);

    // Slide out — cards and text travel together in one direction, so the
    // whole category reads as a single sliding block rather than a fade.
    gsap.to(cards, {
      opacity: 0, x: dir * -70, stagger: 0.03, duration: 0.32, ease: 'power2.in',
      onComplete: () => {
        setDisplay(idx);
        setCatIdx(idx);
      },
    });
    gsap.to(textEls, { opacity: 0, x: dir * -40, duration: 0.28, stagger: 0.02, ease: 'power2.in' });
  }, []);

  /* ── Autoplay — advances every AUTOPLAY_MS, loops back to 0 ─────── */
  const startAutoplay = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      const next = (catIdxRef.current + 1) % FEATURED.length;
      switchCategory(next, 1); // autoplay always advances forward, even across the wrap
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

  /* ── Mobile: reveal each carousel page's cards + strip once, the first
        time it becomes active (swipe or autoplay) — gives every category its
        own arrival flourish, mirroring the desktop bento's per-switch slide.
        Page 0 stays owned by the entrance effect above (revealedPagesRef is
        pre-seeded with it) so the two never touch the same elements. This
        only ever animates opacity/scale/borderRadius — never scrollLeft — so
        it can't race the autoplay glide/wrap logic the way that bug did. ─── */
  const revealedPagesRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Pre-hide every real page except page 0 (owned above) and the trailing
    // clone (always identical to page 0, which is already revealed by then —
    // hiding it too would risk a blank flash right at the wrap moment).
    const pages = Array.from(carousel.querySelectorAll<HTMLElement>(`.${styles.mobilePage}`));
    const realPages = pages.slice(0, FEATURED.length);

    if (prefersReducedMotion()) return;

    realPages.slice(1).forEach((page) => {
      const cards = Array.from(page.querySelectorAll<HTMLElement>(`.${styles.mobileCard}`));
      const strip = [
        page.querySelector<HTMLElement>(`.${styles.mobileStripLabel}`),
        page.querySelector<HTMLElement>(`.${styles.mobileStripTitle}`),
      ].filter((el): el is HTMLElement => Boolean(el));
      if (cards.length) gsap.set(cards, { opacity: 0, scale: 0.92, borderRadius: 40 });
      if (strip.length) gsap.set(strip, { opacity: 0, y: 12 });
    });
  }, [FEATURED.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    if (revealedPagesRef.current.has(activePage)) return;
    revealedPagesRef.current.add(activePage);
    if (prefersReducedMotion()) return;

    const carousel = carouselRef.current;
    if (!carousel) return;
    const page = carousel.querySelectorAll<HTMLElement>(`.${styles.mobilePage}`)[activePage];
    if (!page) return;

    const cards = Array.from(page.querySelectorAll<HTMLElement>(`.${styles.mobileCard}`));
    const strip = [
      page.querySelector<HTMLElement>(`.${styles.mobileStripLabel}`),
      page.querySelector<HTMLElement>(`.${styles.mobileStripTitle}`),
    ].filter((el): el is HTMLElement => Boolean(el));

    if (cards.length) gsap.to(cards, {
      opacity: 1, scale: 1, borderRadius: 0,
      stagger: 0.06, duration: 0.5, ease: 'power3.out',
    });
    if (strip.length) gsap.to(strip, {
      opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.1,
    });
  }, [activePage]);

  /* ── Slide back in whenever displayed category changes ───────────────────
        Slides in from the same side the outgoing category slid out to, so
        cards and text arrive as one continuous block. The random-cardinal
        fly-in stays reserved for the section's own scroll-into-view reveal
        above (a different, first-impression moment). ────────────────────── */
  useEffect(() => {
    const cards   = cardRefs.current.filter(Boolean);
    const textEls = [textLabelRef.current, textTitleRef.current].filter(Boolean);
    const dir = lastCatDirRef.current;

    gsap.set(cards, { x: dir * 70, y: 0, opacity: 0, borderRadius: CARD_RADIUS });
    gsap.to(cards, {
      x: 0, opacity: 1, borderRadius: 0,
      stagger: 0.05, duration: 0.6, ease: 'power3.out',
      onComplete: () => { isAnimating.current = false; },
    });

    gsap.fromTo(
      textEls,
      { opacity: 0, x: dir * 40 },
      { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.1 },
    );
  }, [display]);

  /* ── Mobile autoplay — advance the carousel every AUTOPLAY_MS ────────────
        Native scrollTo({behavior:'smooth'}) is suppressed page-wide (Lenis)
        and gsap treats `scrollLeft` as CSS (no-op). Direct scrollLeft
        assignment is the only thing that moves it — glide it with a
        timer-stepped tween (mirrors PhilosophySection's mobile autoplay).
        isAutoScrollingRef tells onCarouselScroll to leave the clone→real
        wrap-reset to glideTo's own completion below — otherwise the mid-glide
        scroll event's reset (scrollLeft = 0) fights the still-running tween
        (whose next tick overwrites it back toward the clone), and the
        carousel freezes right at the wrap boundary. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const sc = carouselRef.current;
    if (!sc) return;

    let stepId: ReturnType<typeof setInterval> | null = null;
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const glideTo = (to: number) => {
      if (stepId) clearInterval(stepId);
      isAutoScrollingRef.current = true;
      const from = sc.scrollLeft;
      const dist = to - from;
      const dur = 600;
      const t0 = performance.now();
      stepId = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / dur);
        sc.scrollLeft = from + dist * easeInOutQuad(k);
        if (k >= 1 && stepId) {
          clearInterval(stepId);
          stepId = null;
          if (sc.scrollLeft >= FEATURED.length * sc.clientWidth - 2) {
            sc.scrollLeft = 0;
            setActivePage(0);
          }
          isAutoScrollingRef.current = false;
        }
      }, 16);
    };

    const id = setInterval(() => {
      const cur = Math.round(sc.scrollLeft / sc.clientWidth) % FEATURED.length;
      // Always advance forward — past the last real page we glide onto the
      // clone, then glideTo's completion snaps back to page 0 (seamless wrap).
      glideTo((cur + 1) * sc.clientWidth);
    }, AUTOPLAY_MS);

    return () => { clearInterval(id); if (stepId) clearInterval(stepId); };
  }, [FEATURED.length]);

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
    // While autoplay is gliding, its own completion handles the clone→real
    // wrap (see the mobile-autoplay effect) — just track the active dot here.
    if (isAutoScrollingRef.current) {
      setActivePage(Math.round(el.scrollLeft / w) % FEATURED.length);
      return;
    }
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
          const realIdx = i % FEATURED.length;
          // Three rows per page. Each entry = that row's card count (1 = wide,
          // 2 = square pair). Bento rhythm alternates per category so no two
          // adjacent pages read the same. Cards fill sequentially from projects.
          const layout = MOBILE_ROW_LAYOUTS[realIdx] ?? MOBILE_ROW_LAYOUTS[0];
          const projs  = c.projects;
          let cursor   = 0;
          const rows   = layout.map(count => {
            const imgs = projs.slice(cursor, cursor + count).filter(Boolean);
            cursor += count;
            return { isPair: count === 2, imgs };
          });
          return (
            <div key={i} ref={i === 0 ? mobileFirstPageRef : undefined} className={styles.mobilePage}>
              <div className={styles.mobileStrip}>
                <span className={styles.mobileStripLabel}>{tLabel()}</span>
                <span className={styles.mobileStripTitle}>{tName(c.id, c.name)}</span>
              </div>

              {rows.map((row, r) => (
                <div key={r} className={`${styles.mobileBentoRow} ${row.isPair ? styles.mobileBentoPair : styles.mobileBentoWide}`}>
                  {row.imgs.map(p => (
                    <a key={p.id} href={p.href}
                       className={`${styles.mobileCard} ${row.isPair ? styles.mobileCardSquare : styles.mobileCardWide}`}
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
              ))}
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
