'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { PHILOSOPHY } from '@/content/philosophy';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
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
  const setNavLogoSrc        = useUIStore(s => s.setNavLogoSrc);
  const setNavLogoLight      = useUIStore(s => s.setNavLogoLight);

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
          scheduleNavUpdate(() => {
            // Mobile: white logo + white hamburger over image-top layout.
            // Desktop: dark theme over off-white panel.
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            setNavTheme(isMobile ? 'light' : 'dark');
            setNavStyle('minimal');
            setNavHamburgerLight(true);
            setNavLogoLight(isMobile);
            setNavLogoSrc('/logo-and-brandbook/word-only.svg');
          });
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight, setNavLogoSrc, setNavLogoLight]);

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

  const t = useTranslations('philosophy');
  // Each PHILOSOPHY id maps to a prefix in the `philosophy` namespace;
  // translated copy supersedes content/philosophy.ts for display.
  const KEY_PREFIX: Record<string, string> = {
    essence:       'essence',
    team:          'team',
    international: 'intl',
  };
  const translate = (raw: typeof PHILOSOPHY[number]) => {
    const prefix = KEY_PREFIX[raw.id] ?? '';
    return prefix
      ? {
          ...raw,
          heading:    t(`${prefix}Heading`),
          subheading: t(`${prefix}Subheading`),
          body:       t(`${prefix}Body`),
        }
      : raw;
  };
  const pillar = translate(PHILOSOPHY[pillarIdx]);

  // Mobile scroll-snap pagination
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const onMobileScroll = useCallback(() => {
    const el = mobileScrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    // A clone of slide 0 sits after the last real slide. Once the scroll
    // settles on it, jump instantly back to the real slide 0 → seamless loop
    // (the clone shows identical content, so the jump is invisible).
    if (el.scrollLeft >= PHILOSOPHY.length * w - 2) {
      el.scrollLeft = 0;
      setMobileIdx(0);
      return;
    }
    setMobileIdx(Math.round(el.scrollLeft / w) % PHILOSOPHY.length);
  }, []);

  /* ── Mobile autoplay — advance the pillar scroller every 7s ──────────── */
  // Native scrollTo({behavior:'smooth'}) is suppressed page-wide (Lenis) and
  // gsap treats `scrollLeft` as CSS (no-op). Direct scrollLeft assignment is
  // the only thing that moves it — glide it with a timer-stepped tween.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    const sc = mobileScrollerRef.current;
    if (!sc) return;

    let stepId: ReturnType<typeof setInterval> | null = null;
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const glideTo = (to: number) => {
      if (stepId) clearInterval(stepId);
      const from = sc.scrollLeft;
      const dist = to - from;
      const dur = 600;
      const t0 = performance.now();
      stepId = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / dur);
        sc.scrollLeft = from + dist * easeInOutQuad(k);
        if (k >= 1 && stepId) { clearInterval(stepId); stepId = null; }
      }, 16);
    };

    const id = setInterval(() => {
      const cur = Math.round(sc.scrollLeft / sc.clientWidth) % PHILOSOPHY.length;
      // Always advance forward — past the last real slide we glide onto the
      // clone, then onScroll snaps back to slide 0 (seamless wrap).
      glideTo((cur + 1) * sc.clientWidth);
    }, 7000);

    return () => { clearInterval(id); if (stepId) clearInterval(stepId); };
  }, []);

  return (
    <section ref={sectionRef} data-snap-section="philosophy" className={styles.section}>

      {/* ── Mobile: horizontal scroll-snap between pillars ─────────────── */}
      <div
        ref={mobileScrollerRef}
        className={styles.mobileScroller}
        onScroll={onMobileScroll}
        aria-hidden="true"
      >
        {/* Real slides + a trailing clone of slide 0 for seamless looping. */}
        {[...PHILOSOPHY, PHILOSOPHY[0]].map((p, i) => {
          const tp = translate(p);
          return (
            <div key={i} className={styles.mobilePage}>
              <div
                className={styles.mobileImage}
                style={{ backgroundImage: tp.imageSrc ? `url(${tp.imageSrc})` : undefined }}
              />
              <div className={styles.mobileText}>
                <div className={styles.mobileTop}>
                  <span className={styles.mobileLabel}>{t('label')}</span>
                  <h2 className={styles.mobileHeading}>{tp.heading}</h2>
                </div>
                <div className={styles.mobileBottom}>
                  <p className={styles.mobileSubheading}>{tp.subheading}</p>
                  <p className={styles.mobileBody}>{tp.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile-only fixed dots — overlay outside scroller, anchored under title */}
      <div className={styles.mobileDotsFixed} aria-hidden="true">
        {PHILOSOPHY.map((_, i) => (
          <span
            key={i}
            className={`${styles.mobileDot} ${i === mobileIdx ? styles.mobileDotActive : ''}`}
          />
        ))}
      </div>

      {/* ── Left: text panel ──────────────────────────────────────────── */}
      <div className={styles.textPanel}>

        <div className={styles.pillarsContent}>
          <span ref={sectionLabelRef} className={styles.sectionLabel}>
            {t('label')}
          </span>
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
