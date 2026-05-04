'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import {
  FURNITURE_ITEMS, FURNITURE_INTRO, FURNITURE_CATEGORIES,
  type FurnitureItem, type FurnitureCategory,
} from '@/content/furniture';
import { useUIStore } from '@/store/ui';
import styles from './FurnitureGrid.module.css';

/* ── Furniture card ───────────────────────────────────────────────────────── */
function FurnitureCard({ item }: { item: FurnitureItem }) {
  const [idx, setIdx] = useState(0);
  const images      = item.images;
  const hasMultiple = images.length > 1;

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
      href={item.href}
      className={`${styles.card} ${item.featured ? styles.cardFeatured : ''}`}
    >
      <Image
        src={images[idx]}
        alt={item.name}
        fill
        sizes={item.featured ? '(max-width:768px) 100vw, 50vw' : '(max-width:768px) 50vw, 25vw'}
        style={{ objectFit: 'cover' }}
        className={styles.cardImg}
      />
      <div className={styles.cardOverlay} />

      {/* Carousel controls */}
      {hasMultiple && (
        <>
          <button
            type="button"
            className={`${styles.carouselBtn} ${styles.carouselPrev}`}
            onClick={prev}
            aria-label="Previous image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.carouselBtn} ${styles.carouselNext}`}
            onClick={next}
            aria-label="Next image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className={styles.carouselDots} aria-hidden="true">
            {images.map((_, i) => (
              <span
                key={i}
                className={`${styles.carouselDot} ${i === idx ? styles.carouselDotActive : ''}`}
              />
            ))}
          </div>
        </>
      )}

      {/* "View Item" pill — appears on hover */}
      <div className={styles.cardHover} aria-hidden="true">
        <span className={styles.viewItem}>View Item</span>
      </div>

      {/* Bottom info */}
      <div className={styles.cardBottom}>
        <span className={styles.cardCategory}>{item.category.toUpperCase()}</span>
        <h3 className={styles.cardTitle}>{item.name}</h3>
        <div className={styles.cardMeta}>
          <span>{item.material}</span>
          <span>{item.price}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Category icons ──────────────────────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Chairs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v8H6z" />
      <path d="M4 12h16v3H4z" />
      <path d="M7 15v5M17 15v5" />
    </svg>
  ),
  Tables: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="9" width="20" height="3" rx="1" />
      <path d="M5 12v7M19 12v7" />
    </svg>
  ),
  Consoles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="6" rx="1" />
      <path d="M5 14v4M19 14v4" />
      <path d="M9 11h6" />
    </svg>
  ),
  Shelving: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="2.5" rx="0.5" />
      <rect x="2" y="10.5" width="20" height="2.5" rx="0.5" />
      <rect x="2" y="18" width="20" height="2.5" rx="0.5" />
      <path d="M5 5.5v5M19 5.5v5M5 13v5M19 13v5" />
    </svg>
  ),
  Sofas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13V9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v4" />
      <path d="M2 13h20v4H2z" />
      <path d="M5 17v2M19 17v2" />
      <path d="M2 13a2 2 0 0 1 2-2M22 13a2 2 0 0 0-2-2" />
    </svg>
  ),
  Extras: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
};

/* ── Main grid ────────────────────────────────────────────────────────────── */
export function FurnitureGrid() {
  const sectionRef  = useRef<HTMLElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const hasEntered  = useRef(false);

  const [activeCategory, setActiveCategory] = useState<FurnitureCategory | 'All'>('All');
  const [limit, setLimit] = useState(8);

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
          setNavTheme('dark');
          setNavStyle('minimal');
          setNavBg('transparent');
          setNavShadow(true);
        } else {
          setNavShadow(false);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg, setNavShadow]);

  /* ── Filtered + paginated data ────────────────────────────────────────── */
  const filtered = activeCategory === 'All'
    ? FURNITURE_ITEMS
    : FURNITURE_ITEMS.filter(i => i.category === activeCategory);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  /* ── Card entrance animation ──────────────────────────────────────────── */
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

  /* Reset limit when category changes */
  useEffect(() => { setLimit(8); }, [activeCategory]);

  const lines = FURNITURE_INTRO.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Intro header ────────────────────────────────────────────────── */}
      <div className={styles.introWrap}>
        <div className={styles.intro}>
          <div className={styles.introLeft}>
            <span className={styles.introLabel}>{FURNITURE_INTRO.label}</span>
            <h2 className={styles.introHeadline}>
              {lines.map((line, i) => (
                <span key={i} className={styles.introLine}>{line}</span>
              ))}
            </h2>
          </div>
          <div className={styles.introRight}>
            <p className={styles.introBody}>{FURNITURE_INTRO.body}</p>
            <Link href={FURNITURE_INTRO.cta.href} className={styles.introCta}>
              {FURNITURE_INTRO.cta.label} ↗
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category circle filter ───────────────────────────────────────── */}
      <div className={styles.filterWrap}>
        <div className={styles.filterRow}>
          {(['All', ...FURNITURE_CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              className={`${styles.filterCircle} ${activeCategory === cat ? styles.filterCircleActive : ''}`}
              onClick={() => setActiveCategory(cat as FurnitureCategory | 'All')}
              aria-label={cat}
            >
              <span className={styles.filterCircleIcon}>
                {CATEGORY_ICONS[cat]}
              </span>
              <span className={styles.filterCircleLabel}>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Card grid ────────────────────────────────────────────────────── */}
      <div ref={gridRef} className={styles.grid}>
        {visible.length > 0 ? (
          <>
            {visible.map(item => (
              <FurnitureCard key={item.id} item={item} />
            ))}
            {hasMore && (
              <button
                type="button"
                className={styles.loadMoreCard}
                onClick={() => setLimit(l => l + 4)}
                aria-label="Load more items"
              >
                <span className={styles.loadMoreLabel}>Load more</span>
                <span className={styles.loadMoreArrow} aria-hidden="true">↓</span>
              </button>
            )}
          </>
        ) : (
          <p className={styles.empty}>No items in this category yet.</p>
        )}
      </div>

    </section>
  );
}
