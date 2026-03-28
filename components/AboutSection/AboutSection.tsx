'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ABOUT } from '@/content/about';
import { useUIStore } from '@/store/ui';
import styles from './AboutSection.module.css';

export function AboutSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const linesRef    = useRef<HTMLSpanElement[]>([]);
  const bodyRef     = useRef<HTMLParagraphElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);

  /* ── Nav ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('full');
        }
      },
      { threshold: 0.85 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle]);

  /* ── Entrance animation ─────────────────────────────────────────────── */
  useEffect(() => {
    const lines   = linesRef.current.filter(Boolean);
    const body    = bodyRef.current;
    const stats   = statsRef.current
      ? Array.from(statsRef.current.children) as HTMLElement[]
      : [];

    if (!lines.length) return;

    gsap.set(lines, { opacity: 0, y: 28 });
    gsap.set(body,  { opacity: 0, y: 20 });
    gsap.set(stats, { opacity: 0, y: 24 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const lineDelay = lines.length * 0.14;

          gsap.to(lines, {
            opacity: 1, y: 0,
            stagger: 0.14, duration: 1.0, ease: 'power3.out',
          });
          gsap.to(body, {
            opacity: 1, y: 0,
            duration: 0.9, ease: 'power3.out',
            delay: lineDelay + 0.05,
          });
          gsap.to(stats, {
            opacity: 1, y: 0,
            stagger: 0.1, duration: 0.8, ease: 'power3.out',
            delay: lineDelay + 0.25,
          });
        } else {
          gsap.set(lines, { opacity: 0, y: 28 });
          gsap.set(body,  { opacity: 0, y: 20 });
          gsap.set(stats, { opacity: 0, y: 24 });
        }
      },
      { threshold: 0.4 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const lines = ABOUT.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="about">

      {/* ── Top: headline + body ──────────────────────────────────────── */}
      <div className={styles.content}>
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

        <p ref={bodyRef} className={styles.body}>
          {ABOUT.body}
        </p>
      </div>

      {/* ── Bottom: stats row ─────────────────────────────────────────── */}
      <div ref={statsRef} className={styles.stats}>
        {ABOUT.stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
