'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO } from '@/content/nav';
import { CONTACT } from '@/content/contact';
import { useUIStore } from '@/store/ui';
import styles from './FooterSection.module.css';

/* ── Nav columns ─────────────────────────────────────────────────────────────
   3 columns: Projects | About | Socials
   Projects + About are static (hrefs defined here).
   Socials come from CONTACT.socials.
──────────────────────────────────────────────────────────────────────────── */
const FOOTER_NAV = [
  {
    label: 'Projects',
    links: [
      { label: 'Studio',     href: '/studio'     },
      { label: 'Habitus',    href: '/habitus'     },
      { label: 'Residences', href: '/residences'  },
    ],
  },
  {
    label: 'About',
    links: [
      { label: 'Muem Studio',   href: '/studio'        },
      { label: 'Opportunities', href: '/opportunities'  },
    ],
  },
] as const;

export function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const setNavTheme = useUIStore(s => s.setNavTheme);
  const setNavStyle = useUIStore(s => s.setNavStyle);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('light');    // white logo + bars over dark bg
          setNavStyle('minimal');
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle]);

  const year = new Date().getFullYear();

  return (
    <footer
      ref={sectionRef}
      data-snap-section="footer"
      className={styles.section}
    >

      {/* ── Top row — logo left, CTA right ────────────────────────────── */}
      <div className={styles.topRow}>
        <Link href={LOGO.href} className={styles.logoLink}>
          <Image
            src={LOGO.src}
            alt={LOGO.alt}
            width={40}
            height={40}
            className={styles.logoImg}
          />
          <span className={styles.logoWordmark}>Muem Studio</span>
        </Link>

        <Link href="/contact" className={styles.ctaArea}>
          <span className={styles.ctaText}>Let's talk</span>
          {/* id="footer-cta" — FloatingCTA snaps to this element */}
          <span id="footer-cta" className={styles.ctaBtn}>
            <i className={styles.ctaBtnIcon}>↗</i>
          </span>
        </Link>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className={styles.divider} />

      {/* ── Nav grid — Projects / About / Socials ─────────────────────── */}
      <nav className={styles.navGrid}>
        {FOOTER_NAV.map(col => (
          <div key={col.label} className={styles.navCol}>
            <span className={styles.navColLabel}>{col.label}</span>
            {col.links.map(link => (
              <Link key={link.label} href={link.href} className={styles.navColLink}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Socials column — from CONTACT content */}
        <div className={styles.navCol}>
          <span className={styles.navColLabel}>Socials</span>
          {CONTACT.socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navColLink}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Bottom bar — copyright · email | Privacy  Terms ───────────── */}
      <div className={styles.bottomBar}>
        <div className={styles.copyrightGroup}>
          <span className={styles.copyright}>
            © {year} Muem Studio. All rights reserved.
          </span>
          <span className={styles.copyrightSep} aria-hidden="true">·</span>
          <a href="mailto:hi@muem.com" className={styles.emailLink}>
            hi@muem.com
          </a>
        </div>
        <div className={styles.legalLinks}>
          <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
          <Link href="/terms"   className={styles.legalLink}>Terms</Link>
        </div>
      </div>

    </footer>
  );
}
