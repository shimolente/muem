'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { CONTACT } from '@/content/contact';
import { useUIStore } from '@/store/ui';
import styles from './ContactSection.module.css';

export function ContactSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const hasEntered  = useRef(false);

  // Animated element refs
  const labelRef    = useRef<HTMLSpanElement>(null);
  const lineRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const socialsRef  = useRef<HTMLDivElement>(null);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');   // white logo + bars over dark bg
          setNavStyle('minimal');
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle]);

  /* ── Entrance animation (fires once) ─────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const lines = lineRefs.current.filter(Boolean);

    // Set initial hidden states
    gsap.set(labelRef.current,   { opacity: 0, y: 10 });
    gsap.set(lines,              { opacity: 0, y: 36 });
    gsap.set(taglineRef.current, { opacity: 0, y: 16 });
    gsap.set(ctaRef.current,     { opacity: 0, y: 20 });
    gsap.set(socialsRef.current, { opacity: 0, y: 12 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;

          gsap.to(labelRef.current, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1,
          });
          gsap.to(lines, {
            opacity: 1, y: 0, stagger: 0.08, duration: 0.85, ease: 'power3.out', delay: 0.2,
          });
          gsap.to(taglineRef.current, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.55,
          });
          gsap.to(ctaRef.current, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.4,
          });
          gsap.to(socialsRef.current, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.7,
          });

          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = CONTACT.headline.split('\n');

  return (
    <section ref={sectionRef} data-snap-section="contact" className={styles.section}>

      {/* ── Left: headline + tagline ──────────────────────────────────── */}
      <div className={styles.leftPanel}>
        <span ref={labelRef} className={styles.sectionLabel}>Get in touch</span>

        <h2 className={styles.headline}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={styles.headlineLine}
              ref={el => { lineRefs.current[i] = el; }}
            >
              {line}
            </span>
          ))}
        </h2>

        <p ref={taglineRef} className={styles.tagline}>{CONTACT.tagline}</p>
      </div>

      {/* ── Right: CTA + socials ──────────────────────────────────────── */}
      <div className={styles.rightPanel}>
        <div ref={ctaRef} className={styles.ctaWrapper}>
          <Link href={CONTACT.cta.href} className={styles.cta}>
            {CONTACT.cta.label}
            <i className={styles.ctaArrow}>→</i>
          </Link>
        </div>

        <div ref={socialsRef} className={styles.socialsRow}>
          {CONTACT.socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

    </section>
  );
}
