'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HERO } from '@/content/hero';
import styles from './HeroBackground.module.css';

const BASE_OPACITY = HERO.overlayOpacity;        // 0.39
const ABOUT_OPACITY = BASE_OPACITY + 0.14;       // 0.53 — subtle, not dramatic

/**
 * Fixed full-viewport video backdrop.
 * Listens to scroll and gently increases overlay opacity as the
 * about section snaps into view.
 */
export function HeroBackground() {
  const flatOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aboutSection = document.querySelector<HTMLElement>('[data-snap-section="about"]');
    if (!aboutSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        gsap.to(flatOverlayRef.current, {
          opacity: entry.isIntersecting ? ABOUT_OPACITY : BASE_OPACITY,
          duration: 1.0,
          ease: 'power2.inOut',
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(aboutSection);
    return () => observer.disconnect();
  }, []);

  const gradientBg = `linear-gradient(to top, ${HERO.overlayColor}CC 0%, ${HERO.overlayColor}00 55%)`;

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <video
        className={styles.video}
        src={HERO.videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {/* Bottom gradient — always fixed, makes hero headline readable */}
      <div className={styles.gradientOverlay} style={{ background: gradientBg }} />
      {/* Flat tint — opacity animates on section change */}
      <div
        ref={flatOverlayRef}
        className={styles.flatOverlay}
        style={{ opacity: BASE_OPACITY }}
      />
    </div>
  );
}
