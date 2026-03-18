'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useUIStore } from '@/store/ui';
import styles from './CategoryHero.module.css';

export interface CategoryHeroProps {
  /** Short category name shown in the pill, e.g. 'Studio' */
  category: string;
  /** Headline text — use \n to split into separate animated lines */
  headline: string;
  /** Supporting tagline below the headline */
  tagline:  string;
  /** Absolute path to the hero background image */
  imageSrc: string;
}

export function CategoryHero({ category, headline, tagline, imageSrc }: CategoryHeroProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const pillRef     = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const linesRef    = useRef<HTMLSpanElement[]>([]);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);
  const setNavBg             = useUIStore(s => s.setNavBg);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');          // white logo + links over dark image
          setNavStyle('full');           // show all nav links (inner-page nav)
          setNavHamburgerLight(false);   // reset any override from homepage
          setNavBg('transparent');       // no bg fill over hero image
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight, setNavBg]);

  /* ── GSAP entrance — runs once on mount ──────────────────────────────── */
  useEffect(() => {
    const pill    = pillRef.current;
    const tag     = taglineRef.current;
    const lines   = linesRef.current.filter(Boolean);
    if (!pill || !tag || lines.length === 0) return;

    /* Double rAF: ensure Next.js has committed styles before GSAP reads them */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(pill,  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
          .fromTo(
            lines,
            { opacity: 0, y: 44 },
            { opacity: 1, y: 0,  duration: 1.0, stagger: 0.12 },
            0.3,
          )
          .fromTo(tag,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.65);
      });
    });
  }, []);

  /* Split headline on \n into individual line spans */
  const lines = headline.split('\n');

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* Background image */}
      <div className={styles.bg}>
        <Image
          src={imageSrc}
          alt={`${category} hero`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className={styles.bgImg}
        />
      </div>

      {/* Gradient overlay */}
      <div className={styles.overlay} />

      {/* Centered content */}
      <div className={styles.content}>
        {/* Category label */}
        <div ref={pillRef} className={styles.categoryLabel}>
          {category}
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={styles.headlineLine}
              ref={el => { if (el) linesRef.current[i] = el; }}
            >
              {line}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p ref={taglineRef} className={styles.tagline}>
          {tagline}
        </p>
      </div>

    </section>
  );
}
