'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { PHILOSOPHY } from '@/content/philosophy';
import { useUIStore } from '@/store/ui';
import styles from './PhilosophySection.module.css';

export function PhilosophySection() {
  const [pillarIdx, setPillarIdx] = useState(0);
  const pillarIdxRef    = useRef(0);   // mirrors pillarIdx — avoids stale closure in navigate
  const isAnimating     = useRef(false);
  const hasEntered      = useRef(false);
  const autoTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveringImage = useRef(false);

  const sectionRef    = useRef<HTMLElement>(null);

  // Text element refs — animated as a group during transitions
  const sectionLabelRef = useRef<HTMLSpanElement>(null);
  const numberRef       = useRef<HTMLSpanElement>(null);
  const dividerRef      = useRef<HTMLDivElement>(null);
  const plusRef         = useRef<HTMLSpanElement>(null);
  const statementRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const bodyRef         = useRef<HTMLParagraphElement>(null);
  const navRowRef       = useRef<HTMLDivElement>(null);

  // Image refs
  const imageCardRef    = useRef<HTMLDivElement>(null); // container — for border-radius animation
  const imageRef        = useRef<HTMLDivElement>(null); // inner — for zoom
  const captionRef      = useRef<HTMLSpanElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);

  /* ── Pillar navigation ────────────────────────────────────────────────── */
  const navigate = useCallback((next: number) => {
    if (isAnimating.current || next === pillarIdxRef.current) return;

    const dir  = next > pillarIdxRef.current ? 1 : -1;
    isAnimating.current = true;
    pillarIdxRef.current = next;

    const xOut = dir * 40;

    const textEls = [
      numberRef.current,
      dividerRef.current,
      plusRef.current,
      ...(statementRefs.current.filter(Boolean)),
      bodyRef.current,
    ].filter(Boolean);

    // Kill pan
    gsap.killTweensOf(imageRef.current, 'backgroundPositionX');

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

  const startAutoplay = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      const next = (pillarIdxRef.current + 1) % PHILOSOPHY.length;
      navigate(next);
    }, 7000);
  }, [navigate]);

  // Clean up interval on unmount
  useEffect(() => () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  // If the pillar changes while image is hovered, slot-machine switch the cursor label
  useEffect(() => {
    if (isHoveringImage.current) {
      window.dispatchEvent(new CustomEvent('cursor:switch', { detail: PHILOSOPHY[pillarIdx].pillar }));
    }
  }, [pillarIdx]);

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
    gsap.set(imageRef.current, { opacity: 0, backgroundPositionX: '45%' });
    gsap.set(captionRef.current, { opacity: 0 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;

          gsap.to(imageRef.current, { opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.1 });
          gsap.to(imageRef.current, { backgroundPositionX: '55%', duration: 20, ease: 'none', delay: 0.1 });
          gsap.to(captionRef.current, {
            opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.5,
          });
          gsap.to(sectionLabelRef.current, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2,
          });
          gsap.to(textEls, {
            opacity: 1, y: 0,
            stagger: 0.06, duration: 0.7, ease: 'power3.out', delay: 0.3,
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

    const dir = pillarIdxRef.current > pillarIdx
      ? -1
      : pillarIdxRef.current < pillarIdx
        ? 1
        : 0;

    const xIn = dir * -40;

    const textEls = [
      numberRef.current,
      dividerRef.current,
      plusRef.current,
      ...(statementRefs.current.filter(Boolean)),
      bodyRef.current,
    ].filter(Boolean);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        // Directional radius: rounds the leading edge on entry, then flattens
        const enterRadius = dir === 1 ? '48px 0 0 48px' : '0 48px 48px 0';
        gsap.set(imageCardRef.current, { borderRadius: enterRadius });
        gsap.to(imageCardRef.current, {
          borderRadius: '0px', duration: 0.9, ease: 'power3.out',
          onComplete: () => { if (imageCardRef.current) imageCardRef.current.style.removeProperty('border-radius'); },
        });

        gsap.fromTo(
          textEls,
          { opacity: 0, x: xIn },
          {
            opacity: 1, x: 0,
            stagger: 0.05, duration: 0.6, ease: 'power3.out',
            onComplete: () => { isAnimating.current = false; },
          },
        );
        // Pan direction alternates per pillar — set start position before fading in
        const startPct = pillarIdx % 2 === 0 ? '45%' : '55%';
        const endPct   = pillarIdx % 2 === 0 ? '55%' : '45%';
        gsap.set(imageRef.current, { backgroundPositionX: startPct });
        gsap.to(imageRef.current, { opacity: 1, duration: 0.65, ease: 'power2.out' });
        gsap.to(imageRef.current, { backgroundPositionX: endPct, duration: 20, ease: 'none' });
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

        {/* Nav row: dots */}
        <div ref={navRowRef} className={styles.navRow}>
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
        </div>

      </div>

      {/* ── Right: image card ─────────────────────────────────────────── */}
      <div
        ref={imageCardRef}
        className={styles.imageCard}
        onMouseEnter={() => {
          isHoveringImage.current = true;
          window.dispatchEvent(new CustomEvent('cursor:label', { detail: pillar.pillar }));
        }}
        onMouseLeave={() => {
          isHoveringImage.current = false;
          window.dispatchEvent(new CustomEvent('cursor:reset'));
        }}
      >
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
