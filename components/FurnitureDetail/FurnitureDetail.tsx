'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import {
  type FurnitureItem,
  FURNITURE_COLLECTIONS,
} from '@/content/furniture';
import { useUIStore } from '@/store/ui';
import styles from './FurnitureDetail.module.css';

interface Props {
  item:    FurnitureItem;
  related: FurnitureItem[];
}

export function FurnitureDetail({ item, related }: Props) {
  const sectionRef  = useRef<HTMLElement>(null);
  const infoRef     = useRef<HTMLDivElement>(null);
  const [imgIdx, setImgIdx] = useState(0);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);
  const setNavBg             = useUIStore(s => s.setNavBg);
  const setNavShadow         = useUIStore(s => s.setNavShadow);

  /* ── Nav theming — light bg, dark text ──────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');
          setNavStyle('minimal');
          setNavHamburgerLight(false);
          setNavBg('transparent');
          setNavShadow(false);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight, setNavBg, setNavShadow]);

  /* ── Info panel entrance animation ──────────────────────────────────── */
  useEffect(() => {
    if (!infoRef.current) return;
    const els = infoRef.current.querySelectorAll<HTMLElement>('[data-reveal]');
    gsap.fromTo(
      Array.from(els),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, stagger: 0.07, duration: 0.8, ease: 'power3.out', delay: 0.2 },
    );
  }, []);

  const collection = FURNITURE_COLLECTIONS[item.collection];

  const specs: { label: string; value: string }[] = [
    { label: 'Material',   value: item.material },
    ...(item.dimensions ? [{ label: 'Dimensions', value: item.dimensions }] : []),
    ...(item.finish     ? [{ label: 'Finish',      value: item.finish     }] : []),
    ...(item.leadTime   ? [{ label: 'Lead time',   value: item.leadTime   }] : []),
    ...(item.origin     ? [{ label: 'Origin',      value: item.origin     }] : []),
  ];

  return (
    <>
      {/* ── Product view — sticky image left, info right ───────────────── */}
      <section ref={sectionRef} className={styles.product}>

        {/* Left — sticky image viewer */}
        <div className={styles.imagePanel}>
          <div className={styles.imageMain}>
            <Image
              key={imgIdx}
              src={item.images[imgIdx]}
              alt={item.name}
              fill
              priority
              sizes="(max-width:768px) 100vw, 56vw"
              style={{ objectFit: 'cover' }}
              className={styles.imageMainImg}
            />
          </div>
          {item.images.length > 1 && (
            <div className={styles.thumbStrip}>
              {item.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.thumb} ${i === imgIdx ? styles.thumbActive : ''}`}
                  onClick={() => setImgIdx(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src} alt=""
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — product info */}
        <div ref={infoRef} className={styles.infoPanel}>

          {/* Collection + category breadcrumb */}
          <div className={styles.breadcrumb} data-reveal>
            <span className={styles.breadcrumbCollection}>{item.collection}</span>
            <span className={styles.breadcrumbDot} aria-hidden="true">·</span>
            <span className={styles.breadcrumbCategory}>{item.category}</span>
          </div>

          {/* Name */}
          <h1 className={styles.name} data-reveal>{item.name}</h1>

          {/* Tagline */}
          {item.subtitle && (
            <p className={styles.subtitle} data-reveal>{item.subtitle}</p>
          )}

          {/* Price */}
          <p className={styles.price} data-reveal>{item.price}</p>

          {/* Divider */}
          <hr className={styles.rule} data-reveal />

          {/* Spec grid */}
          <dl className={styles.specs} data-reveal>
            {specs.map(({ label, value }) => (
              <div key={label} className={styles.specRow}>
                <dt className={styles.specLabel}>{label}</dt>
                <dd className={styles.specValue}>{value}</dd>
              </div>
            ))}
          </dl>

          {/* Divider */}
          <hr className={styles.rule} data-reveal />

          {/* Description */}
          {item.description && (
            <p className={styles.description} data-reveal>{item.description}</p>
          )}

          {/* CTAs */}
          <div className={styles.ctas} data-reveal>
            <a
              href="https://wa.me/34686783520"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              Enquire about this piece ↗
            </a>
            <Link href="/habitus" className={styles.ctaSecondary}>
              Browse the full collection
            </Link>
          </div>

        </div>
      </section>

      {/* ── About the collection ──────────────────────────────────────── */}
      {collection && (
        <section className={styles.collection}>
          <div className={styles.collectionInner}>
            <div className={styles.collectionText}>
              <span className={styles.collectionLabel}>About the collection</span>
              <h2 className={styles.collectionName}>{item.collection}</h2>
              <p className={styles.collectionTagline}>{collection.tagline}</p>
              <p className={styles.collectionBody}>{collection.description}</p>
            </div>
            <div className={styles.collectionImage}>
              <Image
                src={item.images[item.images.length > 1 ? 1 : 0]}
                alt={item.collection}
                fill
                sizes="(max-width:768px) 100vw, 44vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Similar pieces ────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.related}>

          <div className={styles.relatedIntro}>
            <span className={styles.relatedSup}>You might also like</span>
            <h2 className={styles.relatedHeading}>Similar Pieces</h2>
            <p className={styles.relatedBody}>
              Pieces that share the same material language, or sit well in the same room.
            </p>
          </div>

          <div className={styles.relatedGrid}>
            {related.map(r => (
              <Link key={r.id} href={r.href} className={styles.relatedCard}>
                <Image
                  src={r.images[0]} alt={r.name}
                  fill
                  sizes="(max-width:768px) 72vw, 25vw"
                  style={{ objectFit: 'cover' }}
                  className={styles.relatedImg}
                />
                <div className={styles.relatedOverlay} />
                <div className={styles.relatedBottom}>
                  <span className={styles.relatedCategory}>
                    {r.category.toUpperCase()}
                  </span>
                  <h3 className={styles.relatedName}>{r.name}</h3>
                  <div className={styles.relatedMeta}>
                    <span>{r.material}</span>
                    <span>{r.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className={styles.relatedCta}>
            <Link href="/habitus" className={styles.relatedCtaLink}>
              Browse all pieces ↗
            </Link>
          </div>

        </section>
      )}
    </>
  );
}
