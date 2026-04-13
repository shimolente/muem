'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { type StudioProject } from '@/content/studio';
import { useUIStore } from '@/store/ui';
import styles from './ProjectDetail.module.css';

interface Props {
  project: StudioProject;
  related: StudioProject[];
}

/*
 * Gallery layout pattern — repeats for longer image lists.
 *
 *  full   → span 3 cols  21:8 panorama         determines its own row height
 *  wide   → span 2 cols  4:3 landscape          determines its row height
 *  narrow → span 1 col   no fixed ratio         stretches to match wide's row height
 *
 *  Row 1:  [        full (3)        ]
 *  Row 2:  [  wide (2)  ][ narrow ]
 *  Row 3:  [ narrow ][  wide (2)  ]
 *  Row 4:  [        full (3)        ]
 *  … repeats
 */
const GALLERY_PATTERN = ['full', 'wide', 'narrow', 'narrow', 'wide', 'full'] as const;
type GallerySlot = typeof GALLERY_PATTERN[number];

export function ProjectDetail({ project, related }: Props) {
  const heroRef     = useRef<HTMLElement>(null);
  const categoryRef = useRef<HTMLSpanElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const locationRef = useRef<HTMLSpanElement>(null);
  const arrowRef    = useRef<HTMLDivElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);
  const setNavBg             = useUIStore(s => s.setNavBg);

  /* ── Nav ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');
          setNavStyle('minimal');
          setNavHamburgerLight(false);
          setNavBg('transparent');
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight, setNavBg]);

  /* ── Hero entrance + arrow bounce ───────────────────────────────────── */
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      gsap.fromTo(
        [categoryRef.current, titleRef.current, locationRef.current],
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 1.0, ease: 'power3.out', delay: 0.15 },
      );
      gsap.fromTo(arrowRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.9, ease: 'power3.out' });
      gsap.to(arrowRef.current, { y: 6, duration: 0.75, ease: 'power1.inOut', repeat: -1, yoyo: true, delay: 1.4 });
    }));
  }, []);

  const [coverImg, ...galleryImgs] = project.images;
  const displayGallery = galleryImgs.length > 0 ? galleryImgs : [coverImg];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src={coverImg} alt={project.title}
            fill priority sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span ref={categoryRef} className={styles.heroCategory}>{project.topology}</span>
          <h1 ref={titleRef} className={styles.heroTitle}>{project.title}</h1>
          <span ref={locationRef} className={styles.heroLocation}>{project.location}</span>
        </div>

        {/* Scroll-down arrow — identical to CategoryHero */}
        <div ref={arrowRef} className={styles.arrow} aria-hidden="true">↓</div>
      </section>

      {/* ── Project intro ─────────────────────────────────────────────── */}
      <div className={styles.intro}>
        <span className={styles.introLabel}>A Muem Studio Project</span>
        {project.subtitle && (
          <h2 className={styles.introSubtitle}>{project.subtitle}</h2>
        )}
        {project.description && (
          <p className={styles.introBody}>{project.description}</p>
        )}
      </div>

      {/* ── Info bar — no top/bottom borders, only column dividers ────── */}
      <div className={styles.infoBar}>
        {[
          { label: 'Building Size', value: project.size     },
          { label: 'Location',      value: project.location },
          { label: 'Typologies',    value: project.topology },
          { label: 'Status',        value: project.status ?? String(project.year) },
        ].map(({ label, value }) => (
          <div key={label} className={styles.infoItem}>
            <span className={styles.infoLabel}>{label}</span>
            <span className={styles.infoValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Gallery — varied 3-column layout ──────────────────────────── */}
      <div className={styles.gallery}>
        {displayGallery.map((src, i) => {
          const slot: GallerySlot = GALLERY_PATTERN[i % GALLERY_PATTERN.length];
          return (
            <div key={i} className={`${styles.galleryItem} ${styles[`gallery_${slot}`]}`}>
              <Image
                src={src}
                alt={`${project.title} — ${i + 2}`}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1200px) 66vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Related projects ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.related}>

          <div className={styles.relatedIntro}>
            <span className={styles.relatedSup}>You might also like</span>
            <h2 className={styles.relatedHeading}>Related Projects</h2>
            <p className={styles.relatedBody}>
              We don&apos;t limit our vision to what you see. To learn more,
              head over and see our diverse architectural services.
            </p>
          </div>

          {/* Cards — styled identically to StudioGrid project cards */}
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <Link key={p.id} href={p.href} className={styles.relatedCard}>
                <Image
                  src={p.images[0]} alt={p.title}
                  fill
                  sizes="(max-width:768px) 100vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className={styles.relatedImg}
                />
                <div className={styles.relatedOverlay} />
                <div className={styles.relatedBottom}>
                  <span className={styles.relatedLocation}>
                    {p.location.toUpperCase()}
                  </span>
                  <h3 className={styles.relatedName}>{p.title}</h3>
                  <div className={styles.relatedMeta}>
                    <span>{p.size}</span>
                    <span>{p.status ?? p.year}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.relatedCta}>
            <Link href="/studio" className={styles.relatedCtaLink}>
              Explore all works ↗
            </Link>
          </div>

        </section>
      )}
    </>
  );
}
