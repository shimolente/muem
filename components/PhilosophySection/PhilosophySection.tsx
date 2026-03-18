'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PHILOSOPHY } from '@/content/philosophy';
import { useUIStore } from '@/store/ui';
import styles from './PhilosophySection.module.css';

export function PhilosophySection() {
  const [pillarIdx, setPillarIdx] = useState(0);
  const pillarIdxRef  = useRef(0);   // mirrors pillarIdx — avoids stale closure in navigate
  const isAnimating   = useRef(false);
  const hasEntered    = useRef(false);

  const sectionRef    = useRef<HTMLElement>(null);

  // Text element refs — animated as a group during transitions
  const sectionLabelRef = useRef<HTMLSpanElement>(null);
  const numberRef       = useRef<HTMLSpanElement>(null);
  const dividerRef      = useRef<HTMLDivElement>(null);
  const plusRef         = useRef<HTMLSpanElement>(null);
  const statementRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const bodyRef         = useRef<HTMLParagraphElement>(null);
  const navRowRef       = useRef<HTMLDivElement>(null);

  // Image ref
  const imageRef        = useRef<HTMLDivElement>(null);
  const captionRef      = useRef<HTMLSpanElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');           // logo dark (over cream panel)
          setNavStyle('minimal');
          setNavHamburgerLight(true);    // hamburger stays white (over dark image)
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
      numberRef.current,
      dividerRef.current,
      plusRef.current,
      ...(statementRefs.current.filter(Boolean)),
      bodyRef.current,
      navRowRef.current,
    ].filter(Boolean);

    // Set initial states
    gsap.set(sectionLabelRef.current, { opacity: 0, y: 10 });
    gsap.set(textEls, { opacity: 0, y: 20 });
    gsap.set(imageRef.current, { opacity: 0 });
    gsap.set(captionRef.current, { opacity: 0 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;

          // Image fades in first
          gsap.to(imageRef.current, {
            opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.1,
          });
          gsap.to(captionRef.current, {
            opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.5,
          });

          // Section label
          gsap.to(sectionLabelRef.current, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2,
          });

          // Text content staggers in
          gsap.to(textEls, {
            opacity: 1, y: 0,
            stagger: 0.06, duration: 0.7, ease: 'power3.out', delay: 0.3,
          });

          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Pillar navigation ────────────────────────────────────────────────── */
  const navigate = useCallback((dir: 1 | -1) => {
    if (isAnimating.current) return;
    const next = (pillarIdxRef.current + dir + PHILOSOPHY.length) % PHILOSOPHY.length;
    if (next === pillarIdxRef.current) return;

    isAnimating.current = true;
    pillarIdxRef.current = next;

    const xOut = dir * 40;  // exit slides in direction of travel
    const xIn  = dir * -40; // enter slides from the opposite side

    const textEls = [
      numberRef.current,
      dividerRef.current,
      plusRef.current,
      ...(statementRefs.current.filter(Boolean)),
      bodyRef.current,
    ].filter(Boolean);

    // Exit
    gsap.to(textEls, {
      opacity: 0, x: xOut, stagger: 0.03, duration: 0.22, ease: 'power2.in',
    });
    gsap.to(imageRef.current, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
    });
    gsap.to(captionRef.current, {
      opacity: 0, duration: 0.2, ease: 'power2.in',
    });

    // After exit completes, update state then animate in
    gsap.delayedCall(0.32, () => {
      setPillarIdx(next);
    });
  }, []);

  /* ── Enter animation after state update ──────────────────────────────── */
  useEffect(() => {
    if (!hasEntered.current) return;

    const dir = pillarIdxRef.current > pillarIdx
      ? -1
      : pillarIdxRef.current < pillarIdx
        ? 1
        : 0;

    // pillarIdx has now caught up with pillarIdxRef after navigate's delayedCall
    const xIn = dir * -40;

    const textEls = [
      numberRef.current,
      dividerRef.current,
      plusRef.current,
      ...(statementRefs.current.filter(Boolean)),
      bodyRef.current,
    ].filter(Boolean);

    // Double rAF — ensure React has committed new pillar content to DOM
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        gsap.fromTo(
          textEls,
          { opacity: 0, x: xIn },
          {
            opacity: 1, x: 0,
            stagger: 0.05, duration: 0.6, ease: 'power3.out',
            onComplete: () => { isAnimating.current = false; },
          },
        );
        gsap.fromTo(
          imageRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.65, ease: 'power2.out' },
        );
        gsap.fromTo(
          captionRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.25 },
        );
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillarIdx]);

  const pillar = PHILOSOPHY[pillarIdx];
  const lines  = pillar.statement.split('\n');

  return (
    <section ref={sectionRef} data-snap-section="philosophy" className={styles.section}>

      {/* ── Left: text panel ──────────────────────────────────────────── */}
      <div className={styles.textPanel}>

        <span ref={sectionLabelRef} className={styles.sectionLabel}>
          Our Philosophy
        </span>

        <div className={styles.pillarsContent}>
          <span ref={numberRef} className={styles.number}>{pillar.number}.</span>
          <div ref={dividerRef} className={styles.divider} />
          <span ref={plusRef} className={styles.plus}>+ {pillar.pillar}</span>

          <h2 className={styles.statement}>
            {lines.map((line, i) => (
              <span
                key={`${pillarIdx}-${i}`}
                className={styles.statementLine}
                ref={el => { statementRefs.current[i] = el; }}
              >
                {line}
              </span>
            ))}
          </h2>

          <p ref={bodyRef} className={styles.body}>{pillar.body}</p>
        </div>

        {/* Nav row: prev / counter / next */}
        <div ref={navRowRef} className={styles.navRow}>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => navigate(-1)}
            aria-label="Previous pillar"
          >
            ←
          </button>
          <span className={styles.counter}>
            {pillar.number} of {String(PHILOSOPHY.length).padStart(2, '0')}
          </span>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => navigate(1)}
            aria-label="Next pillar"
          >
            →
          </button>
        </div>

      </div>

      {/* ── Right: image card ─────────────────────────────────────────── */}
      <div className={styles.imageCard}>
        <div
          ref={imageRef}
          className={styles.imageInner}
          style={{ backgroundImage: pillar.imageSrc ? `url(${pillar.imageSrc})` : undefined }}
        />
        <div className={styles.imageOverlay} />
        <span ref={captionRef} className={styles.imageCaption}>{pillar.imageCaption}</span>
      </div>

    </section>
  );
}
