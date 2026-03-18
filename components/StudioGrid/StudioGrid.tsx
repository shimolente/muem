'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import {
  STUDIO_PROJECTS, STUDIO_INTRO, YEARS,
  matchSizeRange, matchLocation,
  type StudioProject,
} from '@/content/studio';
import { FilterDropdown, type DropdownOption } from '@/components/FilterDropdown/FilterDropdown';
import { useUIStore } from '@/store/ui';
import styles from './StudioGrid.module.css';

/* ── Filter option definitions ───────────────────────────────────────────── */
const TOPOLOGY_OPTIONS: DropdownOption[] = [
  { label: 'Houses',      value: 'Houses'      },
  { label: 'Apartments',  value: 'Apartments'  },
  { label: 'Villas',      value: 'Villas'      },
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial',  value: 'Commercial'  },
  { label: 'Hospitality', value: 'Hospitality' },
];

const LOCATION_OPTIONS: DropdownOption[] = [
  {
    type: 'group', label: 'Bali', value: 'Bali',
    children: [
      { label: 'Berawa',   value: 'Berawa, Bali'   },
      { label: 'Canggu',   value: 'Canggu, Bali'   },
      { label: 'Denpasar', value: 'Denpasar, Bali'  },
      { label: 'Gianyar',  value: 'Gianyar, Bali'   },
      { label: 'Nusa Dua', value: 'Nusa Dua, Bali'  },
      { label: 'Pererenan',value: 'Pererenan, Bali' },
      { label: 'Sanur',    value: 'Sanur, Bali'     },
      { label: 'Seminyak', value: 'Seminyak, Bali'  },
      { label: 'Tabanan',  value: 'Tabanan, Bali'   },
      { label: 'Ubud',     value: 'Ubud, Bali'      },
      { label: 'Uluwatu',  value: 'Uluwatu, Bali'   },
    ],
  },
  { label: 'Lombok', value: 'Lombok, Indonesia' },
];

const SIZE_OPTIONS: DropdownOption[] = [
  { label: 'Small · Up to 300 m²',        value: 'Small'  },
  { label: 'Medium · 300–1,500 m²',       value: 'Medium' },
  { label: 'Large · 1,500–10,000 m²',     value: 'Large'  },
  { label: 'Urban · 10,000+ m²',          value: 'Urban'  },
];

/* Convert flat year strings to DropdownOption[] (skip the "All" entry) */
const YEAR_OPTIONS: DropdownOption[] = YEARS
  .filter(y => !y.startsWith('All'))
  .map(y => ({ label: y, value: y }));

/* ── Project card ─────────────────────────────────────────────────────────── */
function ProjectCard({ project }: { project: StudioProject }) {
  return (
    <Link href={project.href} className={styles.card}>
      <Image
        src={project.imageSrc}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        style={{ objectFit: 'cover' }}
        className={styles.cardImg}
      />
      <div className={styles.cardOverlay} />

      {/* Hover reveal — bottom right */}
      <div className={styles.cardHover} aria-hidden="true">
        <span className={styles.seeDetail}>See Detail</span>
      </div>

      {/* Bottom info: location → title → meta */}
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
  const sectionRef  = useRef<HTMLElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const hasEntered  = useRef(false);

  const [topology, setTopology] = useState('All Topologies');
  const [location, setLocation] = useState('All Locations');
  const [year, setYear]         = useState('All Years');
  const [size, setSize]         = useState('All Sizes');
  const [limit, setLimit]       = useState(8);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);
  const setNavBg    = useUIStore(s => s.setNavBg);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');   // dark text on cream background
          setNavStyle('full');   // keep all nav links visible
          setNavBg('cream');     // fill navbar with matching cream
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg]);

  /* ── Filtered + paginated data ───────────────────────────────────────── */
  const allFiltered = STUDIO_PROJECTS.filter(p => {
    const matchTopology = topology === 'All Topologies' || p.topology === topology;
    const matchLoc      = matchLocation(p.location, location);
    const matchYear     = year  === 'All Years'  || p.year === parseInt(year);
    const matchSize     = size  === 'All Sizes'  || matchSizeRange(p.size, size);
    return matchTopology && matchLoc && matchYear && matchSize;
  });

  const visible = allFiltered.slice(0, limit);
  const hasMore = allFiltered.length > limit;

  /* ── Stagger-in entrance animation ──────────────────────────────────── */
  const animateCards = useCallback(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>(`.${styles.card}`);
    if (!cards || cards.length === 0) return;
    gsap.fromTo(
      Array.from(cards),
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' },
    );
  }, []);

  /* Fire entrance once when section first enters viewport */
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

  /* Animate newly revealed cards when filter or limit changes */
  useEffect(() => {
    if (!hasEntered.current) return;
    requestAnimationFrame(() => requestAnimationFrame(animateCards));
  }, [visible.length, animateCards]);

  /* Reset limit when filters change */
  useEffect(() => { setLimit(8); }, [topology, location, year, size]);

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Intro header ────────────────────────────────────────────── */}
      <div className={styles.intro}>
        <div className={styles.introLeft}>
          <span className={styles.introLabel}>{STUDIO_INTRO.label}</span>
          <h2 className={styles.introHeadline}>
            {STUDIO_INTRO.headline.split('\n').map((line, i) => (
              <span key={i} className={styles.introLine}>{line}</span>
            ))}
          </h2>
        </div>
        <div className={styles.introRight}>
          <p className={styles.introBody}>{STUDIO_INTRO.body}</p>
          <a href={STUDIO_INTRO.cta.href} className={styles.introCta}>
            {STUDIO_INTRO.cta.label} ↗
          </a>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <FilterDropdown
          label="Topology"
          value={topology}
          allValue="All Topologies"
          options={TOPOLOGY_OPTIONS}
          onChange={setTopology}
        />
        <FilterDropdown
          label="Location"
          value={location}
          allValue="All Locations"
          options={LOCATION_OPTIONS}
          onChange={setLocation}
        />
        <FilterDropdown
          label="Year of Completion"
          value={year}
          allValue="All Years"
          options={YEAR_OPTIONS}
          onChange={setYear}
        />
        <FilterDropdown
          label="Size"
          value={size}
          allValue="All Sizes"
          options={SIZE_OPTIONS}
          onChange={setSize}
        />
      </div>

      {/* ── Card grid ────────────────────────────────────────────────── */}
      <div ref={gridRef} className={styles.grid}>
        {visible.length > 0 ? (
          visible.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className={styles.empty}>No projects match the selected filters.</p>
        )}
      </div>

      {/* ── Load more ────────────────────────────────────────────────── */}
      {hasMore && (
        <div className={styles.loadMoreRow}>
          <button
            className={styles.loadMore}
            onClick={() => setLimit(l => l + 4)}
          >
            Load more →
          </button>
        </div>
      )}

    </section>
  );
}
