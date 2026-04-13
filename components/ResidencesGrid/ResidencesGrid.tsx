'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import {
  RESIDENCES_PROJECTS, RESIDENCES_INTRO,
  unitsAvailable, isSoldOut,
  type ResidenceProject,
} from '@/content/residences';
import { FilterDropdown, type DropdownOption } from '@/components/FilterDropdown/FilterDropdown';
import { useUIStore } from '@/store/ui';
import styles from './ResidencesGrid.module.css';

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

/* ── Filter option lists ──────────────────────────────────────────────────── */
const AVAIL_OPTIONS: DropdownOption[] = [
  { label: 'Available',  value: 'available' },
  { label: 'Sold out',   value: 'soldout'   },
];

const TOPO_OPTIONS: DropdownOption[] = [
  { label: 'Villas',     value: 'Villas'     },
  { label: 'Houses',     value: 'Houses'     },
  { label: 'Apartments', value: 'Apartments' },
];

/* ── Property card ────────────────────────────────────────────────────────── */
function PropertyCard({ project }: { project: ResidenceProject }) {
  const [idx, setIdx] = useState(0);
  const images        = project.images;
  const hasMultiple   = images.length > 1;
  const soldOut       = isSoldOut(project);
  const available     = unitsAvailable(project);

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

      {/* Availability badge — moves with card on hover to stay clear of rounded corners */}
      <div className={`${styles.availBadge} ${soldOut ? styles.availBadgeSold : ''}`}>
        {soldOut
          ? `${project.unitsSold} sold`
          : `${available} of ${project.unitsTotal} available`}
      </div>

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
        <span className={styles.seeDetail}>View Property</span>
      </div>

      <div className={styles.cardBottom}>
        <span className={styles.cardLocation}>{project.location.toUpperCase()}</span>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <div className={styles.cardMeta}>
          <span>{project.size}</span>
          {project.priceFrom && <span>from {project.priceFrom}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── Main grid component ──────────────────────────────────────────────────── */
export function ResidencesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  const [availFilter, setAvailFilter] = useState<string[]>([]);
  const [topoFilter,  setTopoFilter]  = useState<string[]>([]);
  const [limit,       setLimit]       = useState(9);

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
  const allFiltered = RESIDENCES_PROJECTS.filter(p => {
    // availability: if only 'available' → hide sold out; if only 'soldout' → hide available
    // if both or neither selected → show all
    const wantAvail   = availFilter.includes('available');
    const wantSoldOut = availFilter.includes('soldout');
    if (wantAvail && !wantSoldOut  && isSoldOut(p))  return false;
    if (wantSoldOut && !wantAvail  && !isSoldOut(p)) return false;
    // topology
    if (topoFilter.length > 0 && !topoFilter.includes(p.topology)) return false;
    return true;
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
  useEffect(() => { setLimit(9); }, [availFilter, topoFilter]);

  const lines = RESIDENCES_INTRO.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Intro header ────────────────────────────────────────────────── */}
      <div className={styles.introWrap}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            <span className={styles.introLabel}>{RESIDENCES_INTRO.label}</span>
            <h2 className={styles.introHeadline}>
              {lines.map((line, i) => (
                <span key={i} className={styles.introLine}>{line}</span>
              ))}
            </h2>
          </div>
          <div className={styles.introRight}>
            <p className={styles.introBody}>{RESIDENCES_INTRO.body}</p>
          </div>
        </div>
      </div>

      {/* ── Filter bar — 2 columns matching Studio style ─────────────────── */}
      <div className={styles.filterBarWrap}>
        <div className={styles.filterBar}>
          <FilterDropdown
            label="Availability"
            allValue="All Availability"
            options={AVAIL_OPTIONS}
            values={availFilter}
            onChange={setAvailFilter}
            filled
          />
          <FilterDropdown
            label="Property type"
            allValue="All Types"
            options={TOPO_OPTIONS}
            values={topoFilter}
            onChange={setTopoFilter}
            filled
          />
        </div>
      </div>

      {/* ── Card grid ────────────────────────────────────────────────────── */}
      <div ref={gridRef} className={styles.grid}>
        {visible.length > 0 ? (
          visible.map(project => (
            <PropertyCard key={project.id} project={project} />
          ))
        ) : (
          <p className={styles.empty}>No properties match the selected filters.</p>
        )}
      </div>

      {/* ── Load more ─────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className={styles.loadMoreRow}>
          <button className={styles.loadMore} onClick={() => setLimit(l => l + 3)}>
            Load more
          </button>
        </div>
      )}

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div className={styles.process}>
        <div className={styles.processInner}>
          <span className={styles.processLabel}>How it works</span>
          <h2 className={styles.processHeading}>Simple by design.</h2>

          <div className={styles.processSteps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>01</span>
              <h3 className={styles.stepTitle}>Choose your property</h3>
              <p className={styles.stepBody}>
                Browse our curated portfolio and select the development that speaks to you —
                whether for personal use, rental yield, or long-term investment.
              </p>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNum}>02</span>
              <h3 className={styles.stepTitle}>Connect with the developer</h3>
              <p className={styles.stepBody}>
                No agencies, no middlemen. We put you in direct contact with the property
                developer to discuss availability, terms, and next steps at your own pace.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/34686783520"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.processCta}
          >
            Contact the developer ↗
          </a>
        </div>
      </div>

    </section>
  );
}
