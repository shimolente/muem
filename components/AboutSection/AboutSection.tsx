'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ABOUT } from '@/content/about';
import { useUIStore } from '@/store/ui';
import styles from './AboutSection.module.css';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef   = useRef<HTMLSpanElement[]>([]);
  const bodyRef    = useRef<HTMLParagraphElement>(null);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);

  /* ── Nav: full links while about is visible ────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light'); // white bars over dark video still showing behind
          setNavStyle('full');
        }
      },
      { threshold: 0.85 }, // high threshold — only fires when truly settled here, not during scroll-through
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle]);

  useEffect(() => {
    const lines = linesRef.current.filter(Boolean);
    const body  = bodyRef.current;
    if (!lines.length || !body) return;

    // Start hidden — set on each line individually, NOT on the parent h2
    gsap.set(lines, { opacity: 0, y: 28 });
    gsap.set(body,  { opacity: 0, y: 20 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(lines, {
            opacity: 1,
            y: 0,
            stagger: 0.14,
            duration: 1.0,
            ease: 'power3.out',
          });
          gsap.to(body, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: lines.length * 0.14 + 0.05,
          });
        } else {
          // Reset so animation replays on scroll back
          gsap.set(lines, { opacity: 0, y: 28 });
          gsap.set(body,  { opacity: 0, y: 20 });
        }
      },
      { threshold: 0.5 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const lines = ABOUT.headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section} data-snap-section="about">
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
    </section>
  );
}
