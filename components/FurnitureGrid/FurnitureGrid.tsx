'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
          setNavBg('cream');
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

      {/* ── Category pill filter ─────────────────────────────────────────── */}
      <div className={styles.filterWrap}>
        <div className={styles.filterRow}>
          {(['All', ...FURNITURE_CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              className={`${styles.filterPill} ${activeCategory === cat ? styles.filterPillActive : ''}`}
              onClick={() => setActiveCategory(cat as FurnitureCategory | 'All')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Card grid ────────────────────────────────────────────────────── */}
      <div ref={gridRef} className={styles.grid}>
        {visible.length > 0 ? (
          visible.map(item => (
            <FurnitureCard key={item.id} item={item} />
          ))
        ) : (
          <p className={styles.empty}>No items in this category yet.</p>
        )}
      </div>

      {/* ── Load more ────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className={styles.loadMoreRow}>
          <button className={styles.loadMore} onClick={() => setLimit(l => l + 4)}>
            Load more
          </button>
        </div>
      )}

    </section>
  );
}
