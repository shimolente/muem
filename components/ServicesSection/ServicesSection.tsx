'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { revealUp } from '@/lib/animation';
import { SERVICES, type Service } from '@/content/services';
import { useUIStore } from '@/store/ui';
import styles from './ServicesSection.module.css';

/* ─── Main component ──────────────────────────────────────────────────────── */
export function ServicesSection() {
  const [active, setActive]       = useState<Service>(SERVICES[0]);
  const [animating, setAnimating] = useState(false);

  // Content refs (for transition animation)
  const contentRef  = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  // Sidebar item refs — same pattern as Navbar
  const itemRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIdRef = useRef(SERVICES[0].id); // avoids stale closure in callbacks

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);
  const setNavBg    = useUIStore(s => s.setNavBg);

  /* ── Sidebar hover — exact Navbar pattern ───────────────────────────────── */
  const handleItemEnter = useCallback((index: number) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: i === index ? 1 : 0.3,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      });
    });
  }, []);

  const DIM = 0.38; // resting opacity for non-active items

  const handleListLeave = useCallback(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: SERVICES[i].id === activeIdRef.current ? 1 : DIM,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      });
    });
  }, []);

  /* ── Keep resting dim state in sync with active selection ───────────────── */
  useEffect(() => {
    activeIdRef.current = active.id;
    if (!hasAnimated.current) return; // don't fight the entrance animation
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: SERVICES[i].id === active.id ? 1 : DIM,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: true,
      });
    });
  }, [active.id]);

  /* ── Entrance animation ─────────────────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Set initial states
    gsap.set(itemRefs.current.filter(Boolean), { opacity: 0, x: -12 });
    gsap.set(contentRef.current, { opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Navbar: light text, no background fill (dark section)
          setNavTheme('light');
          setNavStyle('full');
          setNavBg('transparent');
        }
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          // Sidebar items stagger in, then settle to resting dim state
          gsap.to(itemRefs.current.filter(Boolean), {
            opacity: 1,
            x: 0,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.07,
            delay: 0.1,
            onComplete: () => {
              itemRefs.current.forEach((el, i) => {
                if (!el) return;
                gsap.to(el, {
                  opacity: SERVICES[i].id === activeIdRef.current ? 1 : DIM,
                  duration: 0.4,
                  ease: 'power2.out',
                });
              });
            },
          });

          // Content reveals up (rounded → sharp)
          revealUp(contentRef.current, { delay: 0.35 });
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [setNavTheme, setNavStyle, setNavBg]);

  /* ── Service switch ─────────────────────────────────────────────────────── */
  const handleSelect = useCallback((service: Service) => {
    if (service.id === active.id || animating) return;
    setAnimating(true);

    gsap.to(contentRef.current, {
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActive(service);
        gsap.set(contentRef.current, { y: -12 });
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          onComplete: () => setAnimating(false),
        });
      },
    });
  }, [active.id, animating]);

  return (
    <section id="services" ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>

        {/* ── Left sidebar ────────────────────────────────────────────────── */}
        <nav
          className={styles.sidebar}
          aria-label="Services navigation"
          onMouseLeave={handleListLeave}
        >
          <ul className={styles.list}>
            {SERVICES.map((service, i) => (
              <li key={service.id}>
                <button
                  ref={el => { itemRefs.current[i] = el; }}
                  className={`${styles.sidebarItem} ${
                    active.id === service.id ? styles.sidebarItemActive : ''
                  }`}
                  onMouseEnter={() => handleItemEnter(i)}
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
          <p className={styles.tagline}>{active.tagline}</p>

          {/* Title */}
          <h2 className={styles.title}>{active.title}</h2>

          {/* Description */}
          <div className={styles.description}>
            {active.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Image — fills remaining vertical space */}
          {/* TODO: swap each service's image path in content/services.ts */}
          <div className={styles.imageWrap} data-card>
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
