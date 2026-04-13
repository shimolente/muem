'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ABOUT } from '@/content/about';
import { useUIStore } from '@/store/ui';
import styles from './AboutSection.module.css';

/** Parse "3+", "15+", "98%", "200+" → numeric target + suffix */
function parseValue(raw: string): { target: number; suffix: string } {
  const m = raw.match(/^(\d+(?:\.\d+)?)(\D*)$/);
  if (!m) return { target: 0, suffix: raw };
  return { target: parseFloat(m[1]), suffix: m[2] };
}

export function AboutSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const linesRef    = useRef<HTMLSpanElement[]>([]);
  const statsRef    = useRef<HTMLDivElement>(null);
  const numRefs     = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimated = useRef(false);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setFloatingArrowHide = useUIStore(s => s.setFloatingArrowHide);

  /* ── Nav ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('full');
          setFloatingArrowHide(true);   // hide ↓ arrow on this section
        } else {
          setFloatingArrowHide(false);  // restore on other sections
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setFloatingArrowHide]);

  /* ── Entrance animation ─────────────────────────────────────────────── */
  useEffect(() => {
    const lines = linesRef.current.filter(Boolean);
    const stats = statsRef.current
      ? Array.from(statsRef.current.children) as HTMLElement[]
      : [];

    if (!lines.length) return;

    gsap.set(lines, { opacity: 0, y: 28 });
    gsap.set(stats, { opacity: 0, y: 24 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const lineDelay = lines.length * 0.14;

          gsap.to(lines, {
            opacity: 1, y: 0,
            stagger: 0.14, duration: 1.0, ease: 'power3.out',
          });

          gsap.to(stats, {
            opacity: 1, y: 0,
            stagger: 0.1, duration: 0.8, ease: 'power3.out',
            delay: lineDelay + 0.15,
          });

          // Count-up each number
          ABOUT.stats.forEach((stat, i) => {
            const el = numRefs.current[i];
            if (!el) return;
            const { target, suffix } = parseValue(stat.value);
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.6,
              ease: 'power2.out',
              delay: lineDelay + 0.15 + i * 0.1,
              onUpdate() {
                el.textContent = Math.round(obj.val) + suffix;
              },
              onComplete() {
                el.textContent = stat.value; // ensure exact final string
              },
            });
          });

        } else if (!entry.isIntersecting) {
          gsap.set(lines, { opacity: 0, y: 28 });
          gsap.set(stats, { opacity: 0, y: 24 });
          hasAnimated.current = false;
          // Reset counters so they re-animate on next entry
          ABOUT.stats.forEach((stat, i) => {
            const el = numRefs.current[i];
            if (el) el.textContent = '0';
          });
        }
      },
      { threshold: 0.4 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = ABOUT.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="about">

      <div className={styles.content}>
        {/* ── Headline ─────────────────────────────────────────────── */}
        <h2 className={styles.headline}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={styles.line}
              ref={el => { if (el) linesRef.current[i] = el; }}
            >
              {line}
            </span>
          ))}
        </h2>

        {/* ── Stats row ────────────────────────────────────────────── */}
        <div ref={statsRef} className={styles.stats}>
          {ABOUT.stats.map((stat, i) => (
            <div key={stat.label} className={styles.stat}>
              {/* Ghost holds the final value's width so layout never shifts during count-up */}
              <span className={styles.statValueWrap}>
                <span className={styles.statValueGhost} aria-hidden="true">{stat.value}</span>
                <span
                  ref={el => { numRefs.current[i] = el; }}
                  className={styles.statValue}
                >
                  0
                </span>
              </span>
              <span className={styles.statLabel}>{stat.label}</span>
              <ul className={styles.statTags}>
                {stat.tags.map(tag => (
                  <li key={tag} className={styles.statTag}>{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
