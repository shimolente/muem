'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { NAV_ITEMS, LOGO } from '@/content/nav';
import { useUIStore } from '@/store/ui';
import styles from './Navbar.module.css';

export function Navbar() {
  const itemRefs     = useRef<(HTMLAnchorElement | null)[]>([]);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const backdropRef  = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLAnchorElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const navbarRef    = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  const navTheme          = useUIStore(s => s.navTheme);
  const navStyle          = useUIStore(s => s.navStyle);
  const navLogoLight      = useUIStore(s => s.navLogoLight);
  const navHamburgerLight = useUIStore(s => s.navHamburgerLight);
  const navBg             = useUIStore(s => s.navBg);
  const navShadow         = useUIStore(s => s.navShadow);
  const preloaderDone     = useUIStore(s => s.preloaderDone);

  // ── Navbar entrance — fires once when preloader finishes ──────────────────
  useEffect(() => {
    if (!preloaderDone) return;

    const logo      = logoRef.current;
    const items     = itemRefs.current.filter(Boolean);
    const hamburger = hamburgerRef.current;

    // Set starting state
    gsap.set([logo, ...items, hamburger].filter(Boolean), {
      opacity: 0,
      y: -12,
    });

    // Logo slides in first
    gsap.to(logo, {
      opacity: 1,
      y: 0,
      duration: 0.55,
      ease: 'power3.out',
    });

    // Nav items stagger in shortly after
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.07,
      delay: 0.1,
    });

    // Hamburger (mobile) matches last item timing
    gsap.to(hamburger, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.2,
    });
  }, [preloaderDone]);

  // ── Hide/show for category expand ─────────────────────────────────────────
  useEffect(() => {
    const el = navbarRef.current;
    if (!el) return;
    const onHide = () => gsap.to(el, { yPercent: -100, opacity: 0, duration: 0.4, ease: 'power3.in' });
    const onShow = () => { gsap.to(el, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
      onComplete: () => { gsap.set(el, { clearProps: 'transform' }); },
    }); };
    window.addEventListener('nav:hide', onHide);
    window.addEventListener('nav:show', onShow);
    return () => {
      window.removeEventListener('nav:hide', onHide);
      window.removeEventListener('nav:show', onShow);
    };
  }, []);

  // ── Hover dim siblings ─────────────────────────────────────────────────────
  const handleItemEnter = (index: number) => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { opacity: i === index ? 1 : 0.35, duration: 0.3, ease: 'power2.out', overwrite: true });
    });
  };

  const handleGroupLeave = () => {
    itemRefs.current.forEach(el => {
      if (!el) return;
      gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
    });
  };

  // ── Mobile panel + backdrop ────────────────────────────────────────────────
  useEffect(() => {
    const panel    = overlayRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    if (open) {
      // Show both — panel slides in from right, backdrop fades in
      gsap.set(panel,    { display: 'flex', x: '100%' });
      gsap.set(backdrop, { display: 'block' });
      gsap.to(panel,    { x: '0%',  duration: 0.52, ease: 'power3.inOut' });
      gsap.to(backdrop, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      // Items stagger in from right after panel settles
      const items = panel.querySelectorAll('[data-menu-item]');
      gsap.fromTo(
        items,
        { x: 24, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power3.out', delay: 0.28 },
      );
    } else {
      gsap.to(panel,    {
        x: '100%', duration: 0.42, ease: 'power3.inOut',
        onComplete: () => { gsap.set(panel, { display: 'none' }); },
      });
      gsap.to(backdrop, {
        opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => { gsap.set(backdrop, { display: 'none' }); },
      });
    }
  }, [open]);

  // ── Derived classes ────────────────────────────────────────────────────────
  const isDark      = navTheme === 'dark';
  const isMinimal   = navStyle === 'minimal';
  const hasBg       = navBg === 'cream';
  const logoDark    = isDark && !navLogoLight;
  const hamburgerDark = isDark && !navHamburgerLight;

  return (
    <>
      <header ref={navbarRef} className={[
        styles.navbar,
        isDark      ? styles.navbarDark    : '',
        isMinimal   ? styles.navbarMinimal : '',
        hasBg       ? styles.navbarWithBg  : '',
        navShadow   ? styles.navbarShadow  : '',
      ].filter(Boolean).join(' ')}>

        <Link
          ref={logoRef}
          href={LOGO.href}
          className={`${styles.logo} ${logoDark ? styles.logoDark : ''}`}
          aria-label={LOGO.alt}
          data-nav-logo
          style={{ opacity: 0 }} /* GSAP sets to 1 after preloader */
        >
          <Image src={LOGO.src} alt={LOGO.alt} width={56} height={56} priority />
        </Link>

        <nav
          className={styles.desktopNav}
          onMouseLeave={handleGroupLeave}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              ref={el => { itemRefs.current[i] = el; }}
              className={styles.navItem}
              onMouseEnter={() => handleItemEnter(i)}
            >
              <span className={styles.navLabel}>{item.label}</span>
              {item.sub && (
                <span className={styles.navSub}>{item.sub}</span>
              )}
            </Link>
          ))}
        </nav>

        <button
          ref={hamburgerRef}
          className={[
            styles.hamburger,
            hamburgerDark ? styles.hamburgerDark : '',
            open          ? styles.hamburgerOpen : '',
          ].filter(Boolean).join(' ')}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          style={{ opacity: 0 }} /* GSAP sets to 1 after preloader */
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      </header>

      {/* Backdrop — dims + blurs page behind the panel, click to dismiss */}
      <div
        ref={backdropRef}
        className={`${styles.mobileBackdrop} ${open ? styles.backdropOpen : ''}`}
        style={{ display: 'none' }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Side panel — 1/3 width, right edge */}
      <div ref={overlayRef} className={styles.mobileOverlay} style={{ display: 'none' }}>
        <nav aria-label="Mobile navigation">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              data-menu-item
              className={styles.mobileNavItem}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
