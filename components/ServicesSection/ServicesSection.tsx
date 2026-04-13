'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { SERVICES } from '@/content/services';
import { useUIStore } from '@/store/ui';
import styles from './ServicesSection.module.css';

const N      = SERVICES.length;  // 6
const STEP_H = 160;              // px — vertical spacing between item centres

export function ServicesSection({ navStyle = 'full' }: { navStyle?: 'full' | 'minimal' }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);

  const setNavTheme  = useUIStore(s => s.setNavTheme);
  const setNavStyle  = useUIStore(s => s.setNavStyle);
  const setNavBg     = useUIStore(s => s.setNavBg);
  const setNavShadow = useUIStore(s => s.setNavShadow);

  /* ── Dynamic section height ──────────────────────────────────────────── */
  useLayoutEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;
      if (window.innerWidth < 768) {
        sectionRef.current.style.height = '';
        return;
      }
      sectionRef.current.style.height = `${window.innerHeight + (N - 1) * STEP_H}px`;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ── Nav theming — light bg → dark nav elements ─────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');
          setNavStyle(navStyle);
          setNavBg('transparent');
          setNavShadow(false);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg, setNavShadow, navStyle]);

  /* ── Scroll driver (desktop only) ────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768) return;
      const section = sectionRef.current;
      if (!section) return;

      const scrolled  = window.scrollY - section.offsetTop;
      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

      gsap.set(trackRef.current, { y: -progress * (N - 1) * STEP_H });

      const idx = Math.min(N - 1, Math.round(progress * (N - 1)));
      setActiveIdx(prev => (prev === idx ? prev : idx));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = SERVICES[activeIdx];

  return (
    <section id="services" ref={sectionRef} className={styles.section}>

      {/* ── Desktop sticky viewport ───────────────────────────────────── */}
      <div className={styles.pinned}>

        {/* Left: active service text — vertically centred */}
        <div className={styles.leftPanel}>
          <p className={styles.sectionLabel}>How We Work</p>
          <div key={activeIdx} className={styles.activeContent}>
            {active.tagline && (
              <p className={styles.activeTagline}>{active.tagline}</p>
            )}
            <h2 className={styles.activeTitle}>{active.title}</h2>
            <p className={styles.activeDesc}>{active.description[0]}</p>
          </div>
        </div>

        {/* Centre: scrolling timeline */}
        <div className={styles.centerPanel}>
          {/* Track — GSAP translates upward on scroll */}
          <div ref={trackRef} className={styles.track}>

            {/* "From vision to delivery" header — sits above Phase 01 */}
            <div className={styles.trackHeader}>
              <span className={styles.trackHeadline}>From vision to delivery</span>
            </div>

            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                className={`${styles.item} ${i === activeIdx ? styles.itemActive : ''}`}
              >
                <span className={styles.phaseLabel}>
                  Phase {String(i + 1).padStart(2, '0')}
                </span>
                <div className={styles.dotCol}>
                  <span className={styles.dot} />
                </div>
                <span className={styles.phaseName}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: square image for active service */}
        <div className={styles.rightPanel}>
          <div key={activeIdx} className={styles.imageCard}>
            <Image
              src={active.image}
              alt={active.name}
              fill
              sizes="(max-width:768px) 0vw, 33vw"
              style={{ objectFit: 'cover' }}
              priority={activeIdx === 0}
            />
          </div>
        </div>

      </div>

      {/* ── Mobile: vertical list (desktop hidden) ────────────────────── */}
      <div className={styles.mobileList}>
        {SERVICES.map((s, i) => (
          <div key={s.id} className={styles.mobileItem}>
            <div className={styles.mobileMeta}>
              <span className={styles.mobilePhase}>
                Phase {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.mobileName}>{s.name}</h3>
            </div>
            <div className={styles.mobileBody}>
              <p className={styles.mobileDesc}>{s.description[0]}</p>
              <div className={styles.mobileImage}>
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  sizes="80vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
