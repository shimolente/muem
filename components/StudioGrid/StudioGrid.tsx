'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import {
  STUDIO_INTRO,
  type StudioProject,
} from '@/content/studio';
import { useUIStore } from '@/store/ui';
import { imageUrl } from '@/lib/imageUrl';
import styles from './StudioGrid.module.css';

/* ── Arrow icons ──────────────────────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── Project card with per-card image carousel ────────────────────────────── */
function ProjectCard({ project }: { project: StudioProject }) {
  const [idx, setIdx] = useState(0);
  const images        = project.images;
  const hasMultiple   = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  };

  return (
    <Link
      href={project.href}
      className={`${styles.card} ${project.featured ? styles.cardFeatured : ''}`}
    >
      <Image
        src={imageUrl(images[idx], 'md')}
        alt={project.title}
        fill
        sizes={project.featured ? '(max-width:768px) 100vw, 66vw' : '(max-width:768px) 50vw, 33vw'}
        style={{ objectFit: 'cover' }}
        className={styles.cardImg}
      />
      <div className={styles.cardOverlay} />

      {hasMultiple && (
        <>
          <button type="button" className={`${styles.carouselBtn} ${styles.carouselPrev}`} onClick={prev} aria-label="Previous image">
            <ChevronLeft />
          </button>
          <button type="button" className={`${styles.carouselBtn} ${styles.carouselNext}`} onClick={next} aria-label="Next image">
            <ChevronRight />
          </button>
          <div className={styles.carouselDots} aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={`${styles.carouselDot} ${i === idx ? styles.carouselDotActive : ''}`} />
            ))}
          </div>
        </>
      )}

      <div className={styles.cardBottom}>
        <span className={styles.cardLocation}>{project.location.toUpperCase()}</span>
        <h3 className={styles.cardTitle}>{project.title}</h3>
      </div>
    </Link>
  );
}

/* ── Main grid component ─────────────────────────────────────────────────── */
type StudioGridProps = {
  projects: StudioProject[];
  /** Admin-managed category labels (Category kind: STUDIO). */
  categories: string[];
  /** Pre-select a category — used when arriving via deep-link from the
   *  Featured section (`/studio?category=…`). Matched case-insensitively. */
  initialCategory?: string;
};

export function StudioGrid({ projects, categories, initialCategory }: StudioGridProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);
  const sentinelRef  = useRef<HTMLDivElement>(null);
  const filterWrapRef = useRef<HTMLDivElement>(null);
  const hasEntered   = useRef(false);

  /* Filter bar goes "stuck" once pinned to the top — from then on it overlaps
   * the (dark) card images, so switch the pill text to white for legibility. */
  const [stuck, setStuck] = useState(false);

  /* Resolve a deep-link param to an actual category label, else null. */
  const resolvedInitial =
    categories.find((c) => c.toLowerCase() === (initialCategory ?? '').toLowerCase()) ?? null;

  /* Multi-select filter (frosted pills).
   *  · Set of active category labels. Empty ⇒ show everything (default).
   *  · Each pill toggles independently. No "All" button — nothing selected
   *    already means all. A circular "×" clear button rolls out once ≥1 is
   *    picked, and resets back to the default (empty) state. */
  const [selected, setSelected] = useState<Set<string>>(
    () => (resolvedInitial ? new Set([resolvedInitial]) : new Set()),
  );
  const [limit, setLimit] = useState(9);

  const hasFilter = selected.size > 0;

  const toggleCat = (cat: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };
  const clearAll = () => setSelected(new Set());
  const selectionKey = [...selected].sort().join('|');

  const setNavTheme  = useUIStore(s => s.setNavTheme);
  const setNavStyle  = useUIStore(s => s.setNavStyle);
  const setNavBg     = useUIStore(s => s.setNavBg);
  const setNavShadow = useUIStore(s => s.setNavShadow);

  /* ── Nav theming ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('minimal');
          setNavBg('transparent');
          setNavShadow(true);
        } else {
          setNavShadow(false);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg, setNavShadow]);

  /* ── Filtered + paginated data ────────────────────────────────────────── */
  const allFiltered = !hasFilter
    ? projects
    : projects.filter(p => p.category != null && selected.has(p.category));

  const visible = allFiltered.slice(0, limit);
  const hasMore = allFiltered.length > limit;

  /* ── Entrance + filter animation ─────────────────────────────────────── */
  const animateCards = useCallback(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(`.${styles.card}`);
    if (!cards || cards.length === 0) return;
    revealUp(Array.from(cards), { stagger: 0.06, clearProps: 'borderRadius' });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;
          requestAnimationFrame(() => requestAnimationFrame(animateCards));
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animateCards]);

  useEffect(() => {
    if (!hasEntered.current) return;
    requestAnimationFrame(() => requestAnimationFrame(animateCards));
  }, [visible.length, animateCards]);

  /* Reset limit when filters change */
  useEffect(() => { setLimit(9); }, [selectionKey]);

  /* Detect when the filter bar is pinned to the top (overlapping card images)
   * → toggle white pill text. A sentinel at the bar's resting position leaves
   * the viewport-top band once the bar sticks. */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const wrap     = filterWrapRef.current;
    if (!sentinel || !wrap) return;
    const stickyTop = parseFloat(getComputedStyle(wrap).top) || 28;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${stickyTop + 1}px 0px 0px 0px`, threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const lines = STUDIO_INTRO.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Intro header ────────────────────────────────────────────────── */}
      <div className={styles.introWrap}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            <span className={styles.introLabel}>{STUDIO_INTRO.label}</span>
            <h2 className={styles.introHeadline}>
              {lines.map((line, i) => (
                <span key={i} className={styles.introLine}>{line}</span>
              ))}
            </h2>
          </div>
          <div className={styles.introRight}>
            <p className={styles.introBody}>{STUDIO_INTRO.body}</p>
            <button
              className={styles.introCta}
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {STUDIO_INTRO.cta.label} ↗
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter + grid — wrapper is the sticky filter's containing block, so
           the bar releases at the grid's bottom edge (before Services). ───── */}
      <div className={styles.listWrap}>

        {/* Sentinel marks the filter bar's resting position (for stuck detection). */}
        <div ref={sentinelRef} className={styles.filterSentinel} aria-hidden="true" />

        {/* Multi-select frosted pills. Nothing selected = all shown. A circular
            "×" clear button rolls out once ≥1 pill is active. Sticky until the
            grid ends. */}
        <div ref={filterWrapRef} className={styles.filterBarWrap}>
          <div className={`${styles.filterBar} ${stuck ? styles.filterBarStuck : ''}`}>
            <button
              type="button"
              className={`${styles.clearBtn} ${hasFilter ? styles.clearBtnShown : ''}`}
              onClick={clearAll}
              aria-label="Clear filters"
              tabIndex={hasFilter ? 0 : -1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
            {categories.map((cat) => {
              const active = selected.has(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.filterPill} ${active ? styles.filterPillActive : ''}`}
                  onClick={() => toggleCat(cat)}
                  aria-pressed={active}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Card grid ──────────────────────────────────────────────────── */}
        <div ref={gridRef} className={styles.grid}>
          {visible.length > 0 ? (
            <>
              {visible.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {hasMore && (
                <button
                  type="button"
                  className={styles.loadMoreCard}
                  onClick={() => setLimit(l => l + 3)}
                  aria-label="Load more projects"
                >
                  <span className={styles.loadMoreArrow} aria-hidden="true">+</span>
                  <span className={styles.loadMoreLabel}>Load more</span>
                </button>
              )}
            </>
          ) : (
            <p className={styles.empty}>No projects match the selected filters.</p>
          )}
        </div>

      </div>

    </section>
  );
}
