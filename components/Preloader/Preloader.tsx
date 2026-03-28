'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import styles from './Preloader.module.css';

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const overlayRef            = useRef<HTMLDivElement>(null);
  const logoRef               = useRef<HTMLDivElement>(null);
  const setPreloaderDone      = useUIStore(s => s.setPreloaderDone);

  useEffect(() => {
    // Skip on subsequent visits within the same session
    if (sessionStorage.getItem('muem-preloader-done')) {
      setPreloaderDone(true);
      setVisible(false);
      return;
    }

    const overlay = overlayRef.current;
    const logo    = logoRef.current;
    if (!overlay || !logo) return;

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        sessionStorage.setItem('muem-preloader-done', '1');
        setVisible(false);
      },
    });

    // ── 1. Logo fades + scales in ─────────────────────────────────────────
    tl.fromTo(
      logo,
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' },
    );

    // ── 2. Hold ───────────────────────────────────────────────────────────
    tl.to({}, { duration: 0.55 });

    // ── 3a. Snap — tiny punch outward before the rush ─────────────────────
    tl.to(logo, {
      scale: 1.1,
      duration: 0.12,
      ease: 'power1.out',
    });

    // ── 3b. Rush toward camera — logo zooms out and vanishes ──────────────
    tl.to(logo, {
      scale: 5,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.in',
    }, '-=0.04'); // overlap the snap slightly

    // ── 4. Overlay follows — subtle zoom + fade (camera push-through) ─────
    tl.to(overlay, {
      scale: 1.18,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.inOut',
      onStart: () => setPreloaderDone(true), // nav logo fades in as overlay exits
    }, '<0.08'); // starts just after logo rush begins

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [setPreloaderDone]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
      <div ref={logoRef} className={styles.logoWrap}>
        <Image
          src={LOGO.src}
          alt=""
          width={80}
          height={80}
          priority
        />
      </div>
    </div>
  );
}
