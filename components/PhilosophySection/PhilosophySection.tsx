'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PHILOSOPHY } from '@/content/philosophy';
import { useUIStore } from '@/store/ui';
import styles from './PhilosophySection.module.css';

export function PhilosophySection() {
  const [pillarIdx, setPillarIdx] = useState(0);
  const pillarIdxRef = useRef(0);
  const isAnimating  = useRef(false);
  const hasEntered   = useRef(false);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sectionRef      = useRef<HTMLElement>(null);
  const sectionLabelRef = useRef<HTMLSpanElement>(null);
  const headingRef      = useRef<HTMLHeadingElement>(null);
  const subheadingRef   = useRef<HTMLParagraphElement>(null);
  const bodyRef         = useRef<HTMLParagraphElement>(null);
  const imageRef        = useRef<HTMLDivElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);

  /* ── Pillar navigation ────────────────────────────────────────────────── */
  const navigate = useCallback((next: number) => {
    if (isAnimating.current || next === pillarIdxRef.current) return;

    const dir = next > pillarIdxRef.current ? 1 : -1;
    isAnimating.current = true;
    pillarIdxRef.current = next;

    const textEls = [
      headingRef.current,
      subheadingRef.current,
      bodyRef.current,
    ].filter(Boolean);

    gsap.to(textEls, {
      opacity: 0, x: dir * 40, stagger: 0.03, duration: 0.22, ease: 'power2.in',
    });
    gsap.to(imageRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });

    gsap.delayedCall(0.32, () => { setPillarIdx(next); });
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      const next = (pillarIdxRef.current + 1) % PHILOSOPHY.length;
      navigate(next);
    }, 7000);
  }, [navigate]);

  useEffect(() => () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');
          setNavStyle('minimal');
          setNavHamburgerLight(true);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight]);

  /* ── Entrance animation (fires once) ─────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const textEls = [
      sectionLabelRef.current,
      headingRef.current,
      subheadingRef.current,
      bodyRef.current,
    ].filter(Boolean);

    gsap.set(textEls, { opacity: 0, y: 20 });
    gsap.set(imageRef.current, { opacity: 0 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;

          gsap.to(imageRef.current, { opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.1 });
          gsap.to(textEls, {
            opacity: 1, y: 0,
            stagger: 0.06, duration: 0.7, ease: 'power3.out', delay: 0.2,
            onComplete: () => startAutoplay(),
          });

          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAutoplay]);

  /* ── Enter animation after state update ──────────────────────────────── */
  useEffect(() => {
    if (!hasEntered.current) return;

    const dir = pillarIdxRef.current > pillarIdx ? -1 : pillarIdxRef.current < pillarIdx ? 1 : 0;

    const textEls = [
      headingRef.current,
      subheadingRef.current,
      bodyRef.current,
    ].filter(Boolean);

    gsap.fromTo(
      textEls,
      { opacity: 0, x: dir * -40 },
      {
        opacity: 1, x: 0,
        stagger: 0.05, duration: 0.6, ease: 'power3.out',
        onComplete: () => { isAnimating.current = false; },
      },
    );
    gsap.to(imageRef.current, { opacity: 1, duration: 0.65, ease: 'power2.out' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillarIdx]);

  const pillar = PHILOSOPHY[pillarIdx];

  return (
    <section ref={sectionRef} data-snap-section="philosophy" className={styles.section}>

      {/* ── Left: text panel ──────────────────────────────────────────── */}
      <div className={styles.textPanel}>

        <span ref={sectionLabelRef} className={styles.sectionLabel}>
          Our Philosophy
        </span>

        <div className={styles.pillarsContent}>
          <h2 ref={headingRef} className={styles.heading}>{pillar.heading}</h2>

          <div className={styles.dots} role="tablist" aria-label="Browse pillars">
            {PHILOSOPHY.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === pillarIdx}
                aria-label={`Pillar ${i + 1}`}
                className={`${styles.dot} ${i === pillarIdx ? styles.dotActive : ''}`}
                onClick={() => { navigate(i); startAutoplay(); }}
              />
            ))}
          </div>

          <p ref={subheadingRef} className={styles.subheading}>{pillar.subheading}</p>
          <p ref={bodyRef} className={styles.body}>{pillar.body}</p>
        </div>

      </div>

      {/* ── Right: image ──────────────────────────────────────────────── */}
      <div className={styles.imageCard}>
        <div
          ref={imageRef}
          className={styles.imageInner}
          style={{ backgroundImage: pillar.imageSrc ? `url(${pillar.imageSrc})` : undefined }}
        />
      </div>

    </section>
  );
}
