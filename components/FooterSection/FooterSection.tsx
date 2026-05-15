'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import styles from './FooterSection.module.css';

const FOOTER_LINKS = [
  { key: 'studio',        href: '/studio'        },
  { key: 'habitus',       href: '/habitus'        },
  { key: 'residences',    href: '/residences'     },
  { key: 'company',       href: '/studio'         },
  { key: 'opportunities', href: '/opportunities'  },
] as const;

export function FooterSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const setNavTheme   = useUIStore(s => s.setNavTheme);
  const setNavStyle   = useUIStore(s => s.setNavStyle);
  const setNavLogoSrc = useUIStore(s => s.setNavLogoSrc);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          scheduleNavUpdate(() => {
            setNavTheme('light');
            setNavStyle('minimal');
            setNavLogoSrc(null); // footer shows the mark, not the wordmark
          });
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavLogoSrc]);

  const t = useTranslations('footer');
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
            <span className={styles.logoWordmark}>{t('company')}</span>
          </Link>

          <nav className={styles.navLinks}>
            {FOOTER_LINKS.map(link => (
              <Link key={link.key} href={link.href} className={styles.navLink}>
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Bottom bar — copyright + legal ─────────────────────────── */}
        <div className={styles.bottomBar}>
          <span className={styles.copyright}>
            © {year} {t('company')}. {t('rights')}
          </span>
          <div className={styles.legalLinks}>
            <Link href="/privacy" className={styles.legalLink}>{t('privacy')}</Link>
            <Link href="/terms"   className={styles.legalLink}>{t('terms')}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
