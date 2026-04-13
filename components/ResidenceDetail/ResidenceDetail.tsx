'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { type ResidenceProject, unitsAvailable, isSoldOut } from '@/content/residences';
import { useUIStore } from '@/store/ui';
import styles from './ResidenceDetail.module.css';

interface Props {
  project: ResidenceProject;
  related: ResidenceProject[];
}

/*
 * Gallery layout pattern (same as ProjectDetail).
 *
 *  full   → span 3 cols  21:8 panorama
 *  wide   → span 2 cols  4:3 landscape
 *  narrow → span 1 col   stretches to match wide's row height
 */
const GALLERY_PATTERN = ['full', 'wide', 'narrow', 'narrow', 'wide', 'full'] as const;
type GallerySlot = typeof GALLERY_PATTERN[number];

export function ResidenceDetail({ project, related }: Props) {
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

  /* ── Hero entrance + arrow bounce ────────────────────────────────────── */
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

  const soldOut   = isSoldOut(project);
  const available = unitsAvailable(project);

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
        <div ref={arrowRef} className={styles.arrow} aria-hidden="true">↓</div>
      </section>

      {/* ── Project intro ─────────────────────────────────────────────── */}
      <div className={styles.intro}>
        <span className={styles.introLabel}>A Muem Property</span>
        {project.subtitle && (
          <h2 className={styles.introSubtitle}>{project.subtitle}</h2>
        )}
        {project.description && (
          <p className={styles.introBody}>{project.description}</p>
        )}
      </div>

      {/* ── Info bar ──────────────────────────────────────────────────── */}
      <div className={styles.infoBar}>
        {[
          { label: 'Unit Size',    value: project.size,     special: null },
          { label: 'Location',     value: project.location, special: null },
          {
            label: 'Availability',
            value: soldOut
              ? `${project.unitsSold} sold`
              : `${available} of ${project.unitsTotal} available`,
            special: soldOut ? 'soldout' : 'available',
          },
          { label: 'Price from',   value: project.priceFrom ?? String(project.year), special: null },
        ].map(({ label, value, special }) => (
          <div key={label} className={styles.infoItem}>
            <span className={styles.infoLabel}>{label}</span>
            <span className={`${styles.infoValue} ${special ? styles[`infoValue_${special}`] : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Unit configuration ────────────────────────────────────────── */}
      {(project.bedrooms != null || project.bathrooms != null || project.carPort != null) && (
        <div className={styles.specsRow}>
          {project.bedrooms != null && (
            <div className={styles.specsChip}>
              {/* Bed icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={styles.specsIcon} aria-hidden="true">
                <rect x="1" y="10" width="14" height="3" rx="0.5"/>
                <path d="M3 10V8a1 1 0 011-1h4a1 1 0 011 1v2"/>
                <path d="M9 10V8a1 1 0 011-1h2a1 1 0 011 1v2"/>
                <line x1="1" y1="10" x2="1" y2="8"/>
                <line x1="15" y1="10" x2="15" y2="8"/>
              </svg>
              <span className={styles.specsCount}>{project.bedrooms}</span>
              <span className={styles.specsLabel}>Bedrooms</span>
            </div>
          )}

          {project.bathrooms != null && (
            <>
              <span className={styles.specsDot} aria-hidden="true">·</span>
              <div className={styles.specsChip}>
                {/* Bath/shower icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={styles.specsIcon} aria-hidden="true">
                  <path d="M2 9h12v1.5a4 4 0 01-4 4H6a4 4 0 01-4-4V9z"/>
                  <path d="M4 9V5a2 2 0 012-2h.5"/>
                  <line x1="5" y1="14.5" x2="4.5" y2="16"/>
                  <line x1="11" y1="14.5" x2="11.5" y2="16"/>
                </svg>
                <span className={styles.specsCount}>{project.bathrooms}</span>
                <span className={styles.specsLabel}>Bathrooms</span>
              </div>
            </>
          )}

          {project.carPort != null && (
            <>
              <span className={styles.specsDot} aria-hidden="true">·</span>
              <div className={styles.specsChip}>
                {/* Car port icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={styles.specsIcon} aria-hidden="true">
                  <path d="M2 9h12M3 9l1.5-4h7L13 9"/>
                  <rect x="1" y="9" width="14" height="4" rx="0.5"/>
                  <circle cx="4.5" cy="13" r="1"/>
                  <circle cx="11.5" cy="13" r="1"/>
                </svg>
                <span className={styles.specsCount}>{project.carPort === 0 ? '—' : project.carPort}</span>
                <span className={styles.specsLabel}>Car Port</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Gallery ───────────────────────────────────────────────────── */}
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

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className={styles.process}>
        <div className={styles.processInner}>
          <span className={styles.processLabel}>How it works</span>
          <h2 className={styles.processHeading}>Simple by design.</h2>

          <div className={styles.processSteps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>01</span>
              <h3 className={styles.stepTitle}>Choose your property</h3>
              <p className={styles.stepBody}>
                Browse our curated portfolio and select the development that speaks to you —
                whether for personal use, rental yield, or long-term investment.
              </p>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNum}>02</span>
              <h3 className={styles.stepTitle}>Connect with the developer</h3>
              <p className={styles.stepBody}>
                No agencies, no middlemen. We put you in direct contact with the property
                developer to discuss availability, terms, and next steps at your own pace.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/34686783520"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.processCta}
          >
            Contact the developer ↗
          </a>
        </div>
      </section>

      {/* ── Related properties ────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.related}>

          <div className={styles.relatedIntro}>
            <span className={styles.relatedSup}>You might also like</span>
            <h2 className={styles.relatedHeading}>Similar Properties</h2>
            <p className={styles.relatedBody}>
              Explore more of our curated properties across Bali, Lombok, and beyond.
            </p>
          </div>

          <div className={styles.relatedGrid}>
            {related.map(p => {
              const pSoldOut   = isSoldOut(p);
              const pAvailable = unitsAvailable(p);
              return (
                <Link key={p.id} href={p.href} className={styles.relatedCard}>
                  <Image
                    src={p.images[0]} alt={p.title}
                    fill
                    sizes="(max-width:768px) 100vw, 25vw"
                    style={{ objectFit: 'cover' }}
                    className={styles.relatedImg}
                  />
                  <div className={styles.relatedOverlay} />
                  {/* Mini availability badge */}
                  <div className={`${styles.relatedBadge} ${pSoldOut ? styles.relatedBadgeSold : ''}`}>
                    {pSoldOut ? `${p.unitsSold} sold` : `${pAvailable} available`}
                  </div>
                  <div className={styles.relatedBottom}>
                    <span className={styles.relatedLocation}>{p.location.toUpperCase()}</span>
                    <h3 className={styles.relatedName}>{p.title}</h3>
                    <div className={styles.relatedMeta}>
                      <span>{p.size}</span>
                      {p.priceFrom && <span>from {p.priceFrom}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={styles.relatedCta}>
            <Link href="/residences" className={styles.relatedCtaLink}>
              Browse all properties ↗
            </Link>
          </div>

        </section>
      )}
    </>
  );
}
