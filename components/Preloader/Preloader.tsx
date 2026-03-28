'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import styles from './Preloader.module.css';

export function Preloader() {
  const [visible, setVisible]    = useState(true);
  const overlayRef               = useRef<HTMLDivElement>(null);
  const logoRef                  = useRef<HTMLDivElement>(null);
  const setPreloaderDone         = useUIStore(s => s.setPreloaderDone);

  useEffect(() => {
    // Show only once per browser session — comment out during development if needed
    if (sessionStorage.getItem('muem-preloader-done')) {
      setPreloaderDone(true);
      setVisible(false);
      return;
    }

    const overlay = overlayRef.current;
    const logo    = logoRef.current;
    if (!overlay || !logo) return;

    // Lock scroll while preloader is visible
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        sessionStorage.setItem('muem-preloader-done', '1');
        setVisible(false);
      },
    });

    // ── 1. Fade logo in at centre ─────────────────────────────────────────
    tl.fromTo(
      logo,
      { opacity: 0, scale: 0.88 },
      { opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
    );

    // ── 2. Brief hold ─────────────────────────────────────────────────────
    tl.to({}, { duration: 0.45 });

    // ── 3. Fly logo → nav position, fade overlay ──────────────────────────
    tl.add(() => {
      const navLogoEl = document.querySelector<HTMLElement>('[data-nav-logo]');
      if (!navLogoEl || !logo) return;

      const navRect  = navLogoEl.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();

      // Delta from preloader logo centre → nav logo centre
      const targetX = (navRect.left + navRect.width  / 2) - (logoRect.left + logoRect.width  / 2);
      const targetY = (navRect.top  + navRect.height / 2) - (logoRect.top  + logoRect.height / 2);

      // Scale the preloader logo down to match the nav logo's rendered size
      const targetScale = navRect.width / logoRect.width;

      // Fly the logo
      gsap.to(logo, {
        x: targetX,
        y: targetY,
        scale: targetScale,
        duration: 0.75,
        ease: 'power3.inOut',
        onComplete: () => {
          // Reveal nav logo the instant the preloader logo lands
          setPreloaderDone(true);
        },
      });

      // Fade the dark overlay — starts 0.2 s after fly begins
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        delay: 0.2,
        ease: 'power2.inOut',
      });
    });
  }, [setPreloaderDone]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div ref={logoRef} className={styles.logoWrap}>
        <Image
          src={LOGO.src}
          alt=""
          width={72}
          height={72}
          priority
        />
      </div>
    </div>
  );
}
