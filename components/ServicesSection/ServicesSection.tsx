'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { SERVICES, type Service } from '@/content/services';
import styles from './ServicesSection.module.css';

/* ─── Main component ──────────────────────────────────────────────────────── */
export function ServicesSection() {
  const [active, setActive]       = useState<Service>(SERVICES[0]);
  const [animating, setAnimating] = useState(false);

  const contentRef  = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLParagraphElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const descRef     = useRef<HTMLDivElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  /* ── Entrance animation ─────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const sidebar = section.querySelector(`.${styles.sidebar}`);
          const items   = section.querySelectorAll(`.${styles.sidebarItem}`);

          gsap.fromTo(
            sidebar,
            { opacity: 0, x: -24 },
            { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
          );
          gsap.fromTo(
            items,
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07, delay: 0.15 }
          );
          animateContentIn(0.4);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Content animation helpers ──────────────────────────────────────────── */
  const animateContentIn = useCallback((delay = 0) => {
    const els = [taglineRef.current, titleRef.current, descRef.current, imageRef.current];
    gsap.fromTo(
      els.filter(Boolean),
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.1,
        delay,
      }
    );
  }, []);

  /* ── Service switch ─────────────────────────────────────────────────────── */
  const handleSelect = useCallback((service: Service) => {
    if (service.id === active.id || animating) return;
    setAnimating(true);

    // Fade out
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 14,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        setActive(service);
        // Reset position before fade in
        gsap.set(contentRef.current, { y: -14 });
        // Fade in
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          onComplete: () => setAnimating(false),
        });
      },
    });
  }, [active.id, animating]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>

        {/* ── Left sidebar ────────────────────────────────────────────────── */}
        <nav className={styles.sidebar} aria-label="Services navigation">
          <ul className={styles.list}>
            {SERVICES.map((service) => (
              <li key={service.id}>
                <button
                  className={`${styles.sidebarItem} ${
                    active.id === service.id ? styles.sidebarItemActive : ''
                  }`}
                  onClick={() => handleSelect(service)}
                  aria-current={active.id === service.id ? 'true' : undefined}
                >
                  {service.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right content ───────────────────────────────────────────────── */}
        <div ref={contentRef} className={styles.content}>

          {/* Tagline */}
          <p ref={taglineRef} className={styles.tagline}>
            {active.tagline}
          </p>

          {/* Title */}
          <h2 ref={titleRef} className={styles.title}>
            {active.title}
          </h2>

          {/* Description */}
          <div ref={descRef} className={styles.description}>
            {active.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Image */}
          {/* TODO: swap each service's image path in content/services.ts */}
          <div ref={imageRef} className={styles.imageWrap}>
            <Image
              src={active.image}
              alt={active.name}
              fill
              sizes="(max-width: 768px) 100vw, 65vw"
              className={styles.image}
              priority={active.id === SERVICES[0].id}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
