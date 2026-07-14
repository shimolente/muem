'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { Bath, BedDouble, Car } from 'lucide-react';
import { type ResidenceProject, unitsAvailable, isSoldOut } from '@/content/residences';
import { useUIStore } from '@/store/ui';
import { imageUrl } from '@/lib/imageUrl';
import { DeveloperContactModal } from '@/components/DeveloperContactModal/DeveloperContactModal';
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
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [relatedIdx, setRelatedIdx]   = useState(0);

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
            src={imageUrl(coverImg, 'lg')} alt={project.title}
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
        <button
          type="button"
          className={styles.introCta}
          onClick={() => setContactOpen(true)}
        >
          Contact the developer ↗
        </button>
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
              <BedDouble size={26} strokeWidth={1.6} className={styles.specsIcon} aria-hidden="true" />
              <span className={styles.specsCount}>{project.bedrooms}</span>
              <span className={styles.specsLabel}>Bedrooms</span>
            </div>
          )}

          {project.bathrooms != null && (
            <>
              <span className={styles.specsDot} aria-hidden="true">·</span>
              <div className={styles.specsChip}>
                <Bath size={26} strokeWidth={1.6} className={styles.specsIcon} aria-hidden="true" />
                <span className={styles.specsCount}>{project.bathrooms}</span>
                <span className={styles.specsLabel}>Bathrooms</span>
              </div>
            </>
          )}

          {project.carPort != null && (
            <>
              <span className={styles.specsDot} aria-hidden="true">·</span>
              <div className={styles.specsChip}>
                <Car size={26} strokeWidth={1.6} className={styles.specsIcon} aria-hidden="true" />
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
                src={imageUrl(src, 'md')}
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

          <button
            type="button"
            className={styles.processCta}
            onClick={() => setContactOpen(true)}
          >
            Contact the developer ↗
          </button>
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

          <div
            ref={relatedScrollRef}
            className={styles.relatedGrid}
            onScroll={() => {
              const el = relatedScrollRef.current;
              if (!el) return;
              setRelatedIdx(Math.min(related.length - 1, Math.round(el.scrollLeft / (el.scrollWidth / related.length))));
            }}
          >
            {related.map(p => {
              const pSoldOut   = isSoldOut(p);
              const pAvailable = unitsAvailable(p);
              return (
                <Link key={p.id} href={p.href} className={styles.relatedCard}>
                  <Image
                    src={imageUrl(p.images[0], 'md')} alt={p.title}
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

          <div className={styles.relatedScrollDots} aria-hidden="true">
            {related.map((_, i) => (
              <span
                key={i}
                className={`${styles.relatedScrollDot} ${i === relatedIdx ? styles.relatedScrollDotActive : ''}`}
              />
            ))}
          </div>

          <div className={styles.relatedCta}>
            <Link href="/residences" className={styles.relatedCtaLink}>
              Browse all properties ↗
            </Link>
          </div>

        </section>
      )}

      {/* Modal lives at the fragment root — NOT inside a section — so its fixed
          overlay isn't trapped in a section's stacking context (otherwise the
          later "Similar Properties" section paints over it). */}
      <DeveloperContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        developerPhone={project.developerPhone}
        propertyTitle={project.title}
        propertySlug={project.id}
      />
    </>
  );
}
