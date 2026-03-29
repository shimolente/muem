'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { SERVICES } from '@/content/services';
import { useUIStore } from '@/store/ui';
import styles from './ServicesSection.module.css';

const N      = SERVICES.length;  // 7
const STEP_H = 300;              // px — vertical distance between item centres

export function ServicesSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const itemRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const revealedRef = useRef<boolean[]>(Array.from({ length: N }, (_, i) => i === 0));

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);
  const setNavBg    = useUIStore(s => s.setNavBg);

  /* ── Dynamic section height (tall so sticky can travel) ─────────────── */
  useLayoutEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;
      if (window.innerWidth < 768) {
        sectionRef.current.style.height = '';   // let CSS auto handle mobile
        return;
      }
      sectionRef.current.style.height = `${window.innerHeight + (N - 1) * STEP_H}px`;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('full');
          setNavBg('transparent');
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg]);

  /* ── Initialise items (desktop only) ────────────────────────────────── */
  useEffect(() => {
    if (window.innerWidth < 768) return;
    itemRefs.current.forEach((el, i) => {
      if (!el || i === 0) return;
      const isEven    = i % 2 === 0;
      const contentEl = el.querySelector<HTMLElement>(`.${styles.itemContent}`);
      const imageEl   = el.querySelector<HTMLElement>(`.${styles.itemImage}`);
      if (contentEl) gsap.set(contentEl, { opacity: 0, x: isEven ? -28 : 28 });
      if (imageEl)   gsap.set(imageEl,   { opacity: 0, x: isEven ? 28 : -28 });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Animate one item in or out ──────────────────────────────────────── */
  const animateItem = (i: number, show: boolean) => {
    const el = itemRefs.current[i];
    if (!el) return;
    const isEven    = i % 2 === 0;
    const contentEl = el.querySelector<HTMLElement>(`.${styles.itemContent}`);
    const imageEl   = el.querySelector<HTMLElement>(`.${styles.itemImage}`);
    const dur  = show ? 0.65 : 0.38;
    const ease = show ? 'power3.out' : 'power2.in';
    if (contentEl) gsap.to(contentEl, {
      opacity: show ? 1 : 0,
      x: show ? 0 : (isEven ? -28 : 28),
      duration: dur, ease, overwrite: true,
    });
    if (imageEl) gsap.to(imageEl, {
      opacity: show ? 1 : 0,
      x: show ? 0 : (isEven ? 28 : -28),
      duration: dur, ease, overwrite: true,
    });
  };

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

      // Translate track upward so active dot stays at viewport centre
      gsap.set(trackRef.current, { y: -progress * (N - 1) * STEP_H });

      // Which item is at centre
      const idx = Math.min(N - 1, Math.round(progress * (N - 1)));
      setActiveIdx(prev => (prev === idx ? prev : idx));

      // Reveal / hide items
      for (let i = 0; i < N; i++) {
        const threshold  = i === 0 ? -0.01 : (i / (N - 1)) - 0.02;
        const shouldShow = progress > threshold;
        if (shouldShow !== revealedRef.current[i]) {
          revealedRef.current[i] = shouldShow;
          animateItem(i, shouldShow);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const active = SERVICES[activeIdx];

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      <div className={styles.pinned}>

        {/* Gradient fades — soften items entering / leaving frame */}
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />

        {/* Active service info — top-left overlay */}
        <div className={styles.overlay}>
          <p className={styles.overlayLabel}>How We Work</p>
          <div key={activeIdx} className={styles.overlayContent}>
            <p className={styles.overlayTagline}>{active.tagline}</p>
            <h2 className={styles.overlayTitle}>{active.title}</h2>
            <p className={styles.overlayDesc}>{active.description[0]}</p>
          </div>
        </div>

        {/* Decorative step counter */}
        <span className={styles.bigNum} aria-hidden>
          {String(activeIdx + 1).padStart(2, '0')}
        </span>

        {/* Scrolling track — moves upward, items stay 300px apart */}
        <div ref={trackRef} className={styles.track}>

          {SERVICES.map((s, i) => {
            const isEven = i % 2 === 0; // even → content left, image right
            return (
              <div
                key={s.id}
                ref={el => { itemRefs.current[i] = el; }}
                className={`${styles.item} ${i === activeIdx ? styles.itemActive : ''}`}
              >
                {/* Left column (desktop) */}
                <div className={styles.colLeft}>
                  {isEven ? (
                    <div className={styles.itemContent}>
                      <p className={styles.stepLabel}>
                        Step {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className={styles.itemTitle}>{s.name}</h3>
                    </div>
                  ) : (
                    <div className={styles.itemImage}>
                      <Image
                        src={s.image} alt={s.name} fill
                        sizes="25vw"
                        style={{ objectFit: 'cover' }}
                        priority={i === 0}
                      />
                    </div>
                  )}
                </div>

                {/* Centre column — dot on the line */}
                <div className={styles.colCenter}>
                  <span className={styles.dot} />
                </div>

                {/* Right column (desktop) */}
                <div className={styles.colRight}>
                  {isEven ? (
                    <div className={styles.itemImage}>
                      <Image
                        src={s.image} alt={s.name} fill
                        sizes="25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.itemContent}>
                      <p className={styles.stepLabel}>
                        Step {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className={styles.itemTitle}>{s.name}</h3>
                    </div>
                  )}
                </div>

                {/* Mobile-only: always step + name + image, hidden on desktop */}
                <div className={styles.mobileRow}>
                  <div className={styles.mobileText}>
                    <p className={styles.stepLabel}>
                      Step {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className={styles.itemTitle}>{s.name}</h3>
                  </div>
                  <div className={styles.mobileImage}>
                    <Image
                      src={s.image} alt={s.name} fill
                      sizes="60vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
