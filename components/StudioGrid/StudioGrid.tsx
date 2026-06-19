'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import {
  STUDIO_INTRO, CATEGORIES,
  type StudioProject,
} from '@/content/studio';
import { FilterDropdown, type DropdownOption } from '@/components/FilterDropdown/FilterDropdown';
import { useUIStore } from '@/store/ui';
import { imageUrl } from '@/lib/imageUrl';
import styles from './StudioGrid.module.css';

/* Top-level category id (single-select). 'all' = no category filter. */
type CatId = 'all' | 'residential' | 'hospitality' | 'commercial';

/* Category dropdown options (single-select) — value = CatId. */
const CATEGORY_OPTIONS: DropdownOption[] = CATEGORIES.map(c => ({ label: c.label, value: c.id }));

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
  /** Pre-select all subs of this category — used when arriving via deep-link
   *  from the Featured section (`/studio?category=Residential`). */
  initialCategoryId?: 'residential' | 'hospitality' | 'commercial';
};

export function StudioGrid({ projects, initialCategoryId }: StudioGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  /* Single active category (deep-linked from Featured/landing) + optional
     sub-type refinement chips within it. */
  const [activeCat, setActiveCat] = useState<CatId>(initialCategoryId ?? 'all');
  const [subs,      setSubs]      = useState<string[]>([]);
  const [limit,     setLimit]     = useState(9);

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
  const activeDef = activeCat === 'all'
    ? null
    : CATEGORIES.find(c => c.id === activeCat) ?? null;

  const allFiltered = projects.filter(p => {
    if (!activeDef) return true; // "All"
    // Sub-chips selected → union of their topologies; none → whole category.
    const tops = subs.length > 0
      ? activeDef.subs.filter(s => subs.includes(s.label)).flatMap(s => s.topologies)
      : activeDef.topologies;
    return tops.includes(p.topology);
  });

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
  useEffect(() => { setLimit(9); }, [activeCat, subs]);

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

      {/* ── Filter bar — grey dropdowns: single-select Category (+ optional
           Type refinement within it). Category stays switchable always. ──── */}
      <div className={styles.filterBarWrap}>
        <div className={styles.filterBar}>
          <FilterDropdown
            label="Category"
            allValue="All Categories"
            options={CATEGORY_OPTIONS}
            values={activeCat === 'all' ? [] : [activeCat]}
            onChange={vals => { setActiveCat((vals[0] as CatId) ?? 'all'); setSubs([]); }}
            filled
            single
          />
          {activeDef && activeDef.subs.length > 0 && (
            <FilterDropdown
              label="Type"
              allValue={`All ${activeDef.label}`}
              options={activeDef.subs.map(s => ({ label: s.label, value: s.label }))}
              values={subs}
              onChange={setSubs}
              filled
            />
          )}
        </div>
      </div>

      {/* ── Card grid ────────────────────────────────────────────────────── */}
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
                <span className={styles.loadMoreLabel}>Load more</span>
                <span className={styles.loadMoreArrow} aria-hidden="true">+</span>
              </button>
            )}
          </>
        ) : (
          <p className={styles.empty}>No projects match the selected filters.</p>
        )}
      </div>

    </section>
  );
}
