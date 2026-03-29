'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { CONTACT } from '@/content/contact';
import { LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import styles from './ContactSection.module.css';

const FOOTER_LINKS = [
  { label: 'Studio',        href: '/studio'       },
  { label: 'Habitus',       href: '/habitus'       },
  { label: 'Residences',    href: '/residences'    },
  { label: 'Muem Studio',   href: '/studio'        },
  { label: 'Opportunities', href: '/opportunities' },
] as const;

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasEntered = useRef(false);

  const labelRef   = useRef<HTMLSpanElement>(null);
  const lineRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);

  /* ── Nav theming ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNavTheme('dark');
          setNavStyle('minimal');
          setNavHamburgerLight(false);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [setNavTheme, setNavStyle, setNavHamburgerLight]);

  /* ── Entrance animation ───────────────────────────────────────────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const lines = lineRefs.current.filter(Boolean);

    gsap.set(labelRef.current,   { opacity: 0, y: 10 });
    gsap.set(lines,              { opacity: 0, y: 30 });
    gsap.set(taglineRef.current, { opacity: 0, y: 14 });
    gsap.set(detailsRef.current, { opacity: 0, y: 14 });
    gsap.set(socialsRef.current, { opacity: 0, y: 10 });
    gsap.set(formRef.current,    { opacity: 0, y: 20 });

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered.current) {
          hasEntered.current = true;

          gsap.to(labelRef.current,   { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out', delay: 0.1  });
          gsap.to(lines,              { opacity: 1, y: 0, stagger: 0.07,  duration: 0.8,  ease: 'power3.out', delay: 0.2  });
          gsap.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.45 });
          gsap.to(detailsRef.current, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out', delay: 0.55 });
          gsap.to(socialsRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.65 });
          gsap.to(formRef.current,    { opacity: 1, y: 0, duration: 0.8,  ease: 'power3.out', delay: 0.3  });

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
  const year  = new Date().getFullYear();

  return (
    <section ref={sectionRef} data-snap-section="contact" className={styles.section}>

      {/* ── Main content row ─────────────────────────────────────────── */}
      <div className={styles.mainContent}>

        {/* Left: headline + details + socials */}
        <div className={styles.leftPanel}>
          <div className={styles.leftTop}>
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

          <div className={styles.leftBottom}>
            <div ref={detailsRef} className={styles.contactDetails}>
              <span className={styles.detailLabel}>WhatsApp</span>
              <a
                href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.detailValue}
              >
                {CONTACT.whatsapp}
              </a>
              <span className={styles.detailLabel}>Email</span>
              <a href={`mailto:${CONTACT.email}`} className={styles.detailValue}>{CONTACT.email}</a>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>{CONTACT.location}</span>
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
        </div>

        {/* Right: form */}
        <div className={styles.rightPanel}>
          <form ref={formRef} className={styles.form} onSubmit={e => e.preventDefault()}>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email Address *</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Your email address"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number *</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+1 234 567 8900"
                  autoComplete="tel"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Location</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="City, Country"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>I&apos;m looking for *</label>
              <div className={styles.selectWrapper}>
                <select className={styles.select} defaultValue="" required>
                  <option value="" disabled>Select a service</option>
                  {CONTACT.needs.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Message *</label>
              <textarea
                className={styles.textarea}
                placeholder="Tell us about your project..."
                rows={3}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>

          </form>
        </div>

      </div>

      {/* ── Footer bar — FloatingCTA snaps to #footer-cta ────────────── */}
      <div id="footer-marker" className={styles.footerBar}>
        <Link href={LOGO.href} className={styles.footerLogo}>
          <Image
            src={LOGO.src}
            alt={LOGO.alt}
            width={22}
            height={22}
            className={styles.footerLogoImg}
          />
          <span className={styles.footerLogoWordmark}>Muem Studio</span>
        </Link>

        <nav className={styles.footerNav}>
          {FOOTER_LINKS.map(link => (
            <Link key={link.label} href={link.href} className={styles.footerNavLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.footerRight}>
          <span className={styles.footerCopyright}>© {year} Muem Studio</span>
          <span id="footer-cta" className={styles.footerCtaTarget} aria-hidden="true" />
        </div>
      </div>

    </section>
  );
}
