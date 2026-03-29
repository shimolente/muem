'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import styles from './FooterSection.module.css';

const FOOTER_LINKS = [
  { label: 'Studio',        href: '/studio'        },
  { label: 'Habitus',       href: '/habitus'        },
  { label: 'Residences',    href: '/residences'     },
  { label: 'Muem Studio',   href: '/studio'         },
  { label: 'Opportunities', href: '/opportunities'  },
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
          setNavTheme('light');
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
      <div className={styles.inner}>

        {/* ── Top row — logo + nav links ─────────────────────────────── */}
        <div className={styles.topRow}>
          <Link href={LOGO.href} className={styles.logoLink}>
            <Image
              src={LOGO.src}
              alt={LOGO.alt}
              width={28}
              height={28}
              className={styles.logoImg}
            />
            <span className={styles.logoWordmark}>Muem Studio</span>
          </Link>

          <nav className={styles.navLinks}>
            {FOOTER_LINKS.map(link => (
              <Link key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Bottom bar — copyright + legal ─────────────────────────── */}
        <div className={styles.bottomBar}>
          <span className={styles.copyright}>
            © {year} Muem Studio. All rights reserved.
          </span>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
            <Link href="/terms"   className={styles.legalLink}>Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
