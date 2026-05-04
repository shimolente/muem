'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import {
  STUDIO_PROJECTS, STUDIO_INTRO, CATEGORIES,
  type StudioProject,
} from '@/content/studio';
import { FilterDropdown, type DropdownOption } from '@/components/FilterDropdown/FilterDropdown';
import { useUIStore } from '@/store/ui';
import styles from './StudioGrid.module.css';

/* ── Build DropdownOption[] from a category's subcategories ──────────────── */
function subOptions(catId: string): DropdownOption[] {
  const cat = CATEGORIES.find(c => c.id === catId)!;
  return cat.subs.map(s => ({ label: s.label, value: s.label }));
}

/* ── Derive matching topologies from selected sub-labels ─────────────────── */
function toTopologies(catId: string, subs: string[]): string[] | null {
  if (subs.length === 0) return null; // filter not active
  const cat = CATEGORIES.find(c => c.id === catId)!;
  const tops = new Set<string>();
  for (const sub of cat.subs) {
    if (subs.includes(sub.label)) sub.topologies.forEach(t => tops.add(t));
  }
  return Array.from(tops);
}

/* ── Arrow icons ──────────────────────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
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
        src={images[idx]}
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

      <div className={styles.cardHover} aria-hidden="true">
        <span className={styles.seeDetail}>See Detail</span>
      </div>

      <div className={styles.cardBottom}>
        <span className={styles.cardLocation}>{project.location.toUpperCase()}</span>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <div className={styles.cardMeta}>
          <span>{project.size}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main grid component ─────────────────────────────────────────────────── */
export function StudioGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  /* One sub-filter state per category */
  const [resSubs,  setResSubs]  = useState<string[]>([]);
  const [hosSubs,  setHosSubs]  = useState<string[]>([]);
  const [comSubs,  setComSubs]  = useState<string[]>([]);
  const [limit,    setLimit]    = useState(9);

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
  const rFilter = toTopologies('residential', resSubs);
  const hFilter = toTopologies('hospitality', hosSubs);
  const cFilter = toTopologies('commercial',  comSubs);
  const anyActive = rFilter !== null || hFilter !== null || cFilter !== null;

  const allFiltered = STUDIO_PROJECTS.filter(p => {
    if (!anyActive) return true;
    if (rFilter && rFilter.includes(p.topology)) return true;
    if (hFilter && hFilter.includes(p.topology)) return true;
    if (cFilter && cFilter.includes(p.topology)) return true;
    return false;
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
  useEffect(() => { setLimit(9); }, [resSubs, hosSubs, comSubs]);

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

      {/* ── Filter bar — 3 columns matching image grid ───────────────────── */}
      <div className={styles.filterBarWrap}>
        <div className={styles.filterBar}>
          <FilterDropdown
            label="Residential"
            allValue="All Residential"
            options={subOptions('residential')}
            values={resSubs}
            onChange={setResSubs}
            filled
          />
          <FilterDropdown
            label="Hospitality"
            allValue="All Hospitality"
            options={subOptions('hospitality')}
            values={hosSubs}
            onChange={setHosSubs}
            filled
          />
          <FilterDropdown
            label="Commercial & other"
            allValue="All Commercial"
            options={subOptions('commercial')}
            values={comSubs}
            onChange={setComSubs}
            filled
          />
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
                <span className={styles.loadMoreArrow} aria-hidden="true">↓</span>
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
