'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useUIStore } from '@/store/ui';
import styles from './ComingSoon.module.css';

export interface ComingSoonProps {
  /** Small label above the title, e.g. 'Lifestyle' */
  eyebrow?: string;
  /** Large centered headline */
  title: string;
  /** Absolute path to the full-screen background image */
  imageSrc: string;
}

export function ComingSoon({ eyebrow, title, imageSrc }: ComingSoonProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);
  const setNavBg             = useUIStore(s => s.setNavBg);

  /* ── Nav theming — white logo/hamburger over dark image ──────────────── */
  useEffect(() => {
    setNavTheme('light');
    setNavStyle('minimal');
    setNavHamburgerLight(true);
    setNavBg('transparent');
  }, [setNavTheme, setNavStyle, setNavHamburgerLight, setNavBg]);

  /* ── GSAP entrance ───────────────────────────────────────────────────── */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out', delay: 0.2 },
        );
      });
    });
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.bg}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      <div className={styles.overlay} />

      <div ref={contentRef} className={styles.content}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.status}>Coming Soon</span>
      </div>
    </section>
  );
}
