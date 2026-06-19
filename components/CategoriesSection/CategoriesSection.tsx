'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { CATEGORIES, type Category } from '@/content/categories';
import { FEATURED } from '@/content/featured';
import { useUIStore } from '@/store/ui';
import { scheduleNavUpdate } from '@/lib/navDelay';
import styles from './CategoriesSection.module.css';

type ColState = 'idle' | 'entering' | 'visible' | 'exiting';

// Map category id → i18n key pair in the `categories` namespace.
const CAT_KEYS: Record<string, { label: string; sub: string }> = {
  studio:     { label: 'create',  sub: 'createSub'  },
  habitus:    { label: 'live',    sub: 'liveSub'    },
  residences: { label: 'explore', sub: 'exploreSub' },
};

export function CategoriesSection() {
  const t = useTranslations('categories');
  const router = useRouter();

  // overlayIds tracks which columns currently have the image overlay visible
  // (driven by GSAP state, not mouse state — so text stays white while animating)
  const [overlayIds, setOverlayIds] = useState<Set<string>>(new Set());
  const [active, setActive]         = useState<Category | null>(null);

  const clipRefs        = useRef<Record<string, HTMLDivElement | null>>({});
  const curtainRefs     = useRef<Record<string, HTMLDivElement | null>>({});
  const darkOverlayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Refs to the actual column hover text — measured for pixel-perfect start positions
  const colLabelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const colNameRefs  = useRef<Record<string, HTMLSpanElement | null>>({});

  const expandedRef      = useRef<HTMLDivElement>(null);
  const sectionRef       = useRef<HTMLElement>(null);
  const expandOffsetRef  = useRef<{ labelY: number; nameY: number }>({ labelY: 0, nameY: 0 });
  const expandColRectRef = useRef<DOMRect | null>(null);
  // True while a column is in the expanded/clicked state — blocks runLeave so the
  // overlay appearing (which steals mouseleave from the column) doesn't exit the image
  const isExpandedRef      = useRef(false);
  const pointerRef         = useRef<{ x: number; y: number } | null>(null);
  const scrollCloseRef     = useRef<((e: Event) => void) | null>(null);
  const closeHandlerRef    = useRef<(() => void) | null>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
  const setNavLogoSrc        = useUIStore(s => s.setNavLogoSrc);
  const setNavLogoLight      = useUIStore(s => s.setNavLogoLight);
  const setNavHamburgerLight = useUIStore(s => s.setNavHamburgerLight);
  const sectionVisibleRef    = useRef(false);

  /* ── Animation state machine — prevents mid-flight interruption ─────── */
  const stateRef      = useRef<Record<string, ColState>>({});
  const pendingRef    = useRef<Record<string, 'enter' | 'leave' | null>>({});
  const hoveredColRef = useRef<string | null>(null);

  // Helper: get the expandOrigin for a category id
  const getOrigin = (id: string) => CATEGORIES.find(c => c.id === id)?.expandOrigin;

  // Function declarations so runEnter/runLeave can reference each other (hoisted)
  function runEnter(id: string) {
    const clip    = clipRefs.current[id];
    const curtain = curtainRefs.current[id];
    if (!clip || !curtain) return;
    stateRef.current[id] = 'entering';
    // Mark overlay active — text color follows animation state
    setOverlayIds(prev => new Set([...prev, id]));
    // Logo/hamburger go white for the relevant column position
    const origin = getOrigin(id);
    if (origin === 'left')  setNavLogoLight(true);
    if (origin === 'right') setNavHamburgerLight(true);
    // Image stays put. Curtain lifts off the top to reveal it.
    // Pixel-based translate so motion distance matches column height regardless
    // of curtain's extended height (column + 800px from the -400px insets).
    const colHeight = clip.offsetHeight;
    const liftDist  = colHeight + 500; // overshoot so curtain clears the extension
    gsap.set(clip, { y: '0%' });
    // Convex reveal edge: the curtain's bottom edge domes UP at the centre
    // (quadratic curve via clip-path), so the image is uncovered centre-first —
    // a convex wipe. (border-radius can only round corners → concave; clip-path
    // is set inline so it bypasses the build's CSS minifier entirely.) At idle
    // the dome lives in the -400px bottom extension, so the column stays covered.
    const cw = curtain.offsetWidth;
    const ch = curtain.offsetHeight;
    // Elliptical-arc dome (not a single quadratic — that makes a pointed tip).
    // rx = half-width, ry = arch height. The arc has vertical tangents where it
    // meets the sides, so it blends into the column's vertical edges and rounds
    // smoothly over the top — a rounded arch, not a sharp point.
    const arch = Math.min(cw * 0.434, 238); // arch height (ry) — 30% less rounded
    const convexBottom = `path('M0 0 L${cw} 0 L${cw} ${ch} A${cw / 2} ${arch} 0 0 0 0 ${ch} Z')`;
    gsap.set(curtain, { clipPath: convexBottom, webkitClipPath: convexBottom });
    gsap.fromTo(curtain,
      { y: 0 },
      {
        y: -liftDist,
        duration: 1.1,
        ease: 'power4.out',
        onComplete: () => {
          stateRef.current[id] = 'visible';
          if (pendingRef.current[id] === 'leave') {
            pendingRef.current[id] = null;
            runLeave(id);
          }
        },
      },
    );
  }

  function runLeave(id: string) {
    const clip    = clipRefs.current[id];
    const curtain = curtainRefs.current[id];
    if (!clip || !curtain) return;
    stateRef.current[id] = 'exiting';
    // Kill in-progress tweens; curtain teleports below column for slide-up cover.
    gsap.killTweensOf([clip, curtain]);
    setOverlayIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    const colHeight = clip.offsetHeight;
    const riseDist  = colHeight + 500; // matches reveal's liftDist
    // Cover moves UP (like the reveal), but its leading edge is a ∪ — a
    // DOWNWARD bulge at the centre (not the reveal's ∩ dome). The curtain rises
    // from below; the centre is covered last, and as the edge passes into the
    // -400px top extension the ∪ eases out into a flat, full cover.
    const cw = curtain.offsetWidth;
    const ch = curtain.offsetHeight;
    const arch = Math.min(cw * 0.434, 238); // 30% less rounded — matches runEnter
    const concaveTop = `path('M0 0 A${cw / 2} ${arch} 0 0 0 ${cw} 0 L${cw} ${ch} L0 ${ch} Z')`;
    gsap.set(curtain, { clipPath: concaveTop, webkitClipPath: concaveTop });
    gsap.fromTo(curtain,
      { y: riseDist },
      {
        y: 0,
        duration: 0.75,
        ease: 'power3.inOut',
        onComplete: () => {
          // Reset to enter-ready state: full-rectangle cover, no clip
          gsap.set(curtain, { y: 0, clipPath: 'none', webkitClipPath: 'none' });
          stateRef.current[id] = 'idle';
          const origin = getOrigin(id);
          if (origin === 'left')  setNavLogoLight(false);
          if (origin === 'right') setNavHamburgerLight(false);
          if (pendingRef.current[id] === 'enter') {
            pendingRef.current[id] = null;
            runEnter(id);
          }
        },
      },
    );
  }

  /* ── Hover dispatchers ───────────────────────────────────────────────── */
  const handleEnter = (id: string) => {
    if (window.matchMedia('(hover: none)').matches) return;
    hoveredColRef.current = id;
    const state = stateRef.current[id] ?? 'idle';
    if (state === 'entering' || state === 'visible') {
      pendingRef.current[id] = null; // cancel any queued leave
      return;
    }
    if (state === 'exiting') { pendingRef.current[id] = 'enter'; return; }
    runEnter(id);
  };

  const handleLeave = (id: string) => {
    if (window.matchMedia('(hover: none)').matches) return;
    hoveredColRef.current = null;
    if (isExpandedRef.current) return;
    const state = stateRef.current[id] ?? 'idle';
    if (state === 'idle' || state === 'exiting') {
      pendingRef.current[id] = null; // cancel any queued enter
      return;
    }
    if (state === 'entering') {
      pendingRef.current[id] = 'leave';
      return;
    }
    runLeave(id);
  };

  /* ── Track pointer position for elementFromPoint checks ─────────────── */
  useEffect(() => {
    const onMove = (e: PointerEvent) => { pointerRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  /* ── Nav theme: dark + hamburger while categories is visible ────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Low threshold — fires early for nav theming + exit reset
    const navObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          scheduleNavUpdate(() => {
            // Mobile: white nav over dark image. Desktop: dark nav over off-white columns.
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            setNavTheme(isMobile ? 'light' : 'dark');
            setNavStyle('minimal');
            setNavHamburgerLight(isMobile);
            setNavLogoLight(isMobile);
            setNavLogoSrc('/logo-and-brandbook/word-only.svg');
          });
        }
      },
      { threshold: 0.1 },
    );

    // High threshold — fires after snap settles, safe to elementFromPoint
    const cursorObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !pointerRef.current) return;
        const el = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y);
        const colEl = el?.closest('[data-col-id]') as HTMLElement | null;
        if (colEl?.dataset.colId) handleEnter(colEl.dataset.colId);
      },
      { threshold: 0.9 },
    );

    navObserver.observe(section);
    cursorObserver.observe(section);
    return () => { navObserver.disconnect(); cursorObserver.disconnect(); };
  }, [setNavTheme, setNavStyle, setNavLogoSrc, setNavHamburgerLight, setNavLogoLight]);

  /* ── Click handler — mobile navigates, desktop expands ─────────────── */
  const handleClick = (cat: Category) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      router.push(cat.href);
      return;
    }
    handleExpand(cat);
  };

  /* ── Expand handler ──────────────────────────────────────────────────── */
  const handleExpand = (cat: Category) => {
    // Scroll attempt closes the expanded view. Block the first wheel so the
    // snap doesn't fight the close animation, kill bubble opacity instantly
    // (no lingering fade), detach listeners so the user's next gesture
    // scrolls normally.
    const onScrollAttempt = (e: Event) => {
      e.preventDefault();
      window.removeEventListener('wheel',     onScrollAttempt);
      window.removeEventListener('touchmove', onScrollAttempt);
      const overlay = expandedRef.current;
      if (overlay) {
        const circles = overlay.querySelectorAll<HTMLElement>('[data-expand-circle]');
        gsap.killTweensOf(circles);
        gsap.set(circles, { opacity: 0 });
      }
      closeHandlerRef.current?.();
    };
    scrollCloseRef.current = onScrollAttempt;
    window.addEventListener('wheel',     onScrollAttempt, { passive: false });
    window.addEventListener('touchmove', onScrollAttempt, { passive: false });
    window.dispatchEvent(new CustomEvent('nav:hide'));
    // Snapshot rect now — before any layout changes
    const clipEl = clipRefs.current[cat.id];
    if (clipEl) expandColRectRef.current = clipEl.getBoundingClientRect();
    isExpandedRef.current = true;
    setActive(cat);
  };

  const clipMap: Record<Category['expandOrigin'], string> = {
    left:   'inset(0 67% 0 0)',
    center: 'inset(0 33% 0 33%)',
    right:  'inset(0 0% 0 67%)',
  };

  useEffect(() => {
    if (!active) return;
    const overlay = expandedRef.current;
    if (!overlay) return;
    const clipEl = clipRefs.current[active.id];
    if (!clipEl) return;

    const rect = expandColRectRef.current;

    const darkOverlayEl = darkOverlayRefs.current[active.id];

    // Pin the panel in pixels from the column rect — prevents % positions shifting
    // when the scrollbar disappears and the viewport widens
    const panelEl = overlay.querySelector('[data-expand-panel]') as HTMLElement | null;
    if (panelEl && rect) {
      panelEl.style.left  = `${rect.left}px`;
      panelEl.style.width = `${rect.width}px`;
    }

    // Pin the column's imageClip as fixed at its current screen position
    if (rect) {
      gsap.set(clipEl, {
        position: 'fixed',
        left: rect.left,
        top: 0,          // cover full viewport height — eliminates top/bottom padding gaps
        width: rect.width,
        height: '100svh',
        zIndex: 7,
      });
      // Lock the dark overlay to column width before imageClip starts expanding
      if (darkOverlayEl) {
        gsap.set(darkOverlayEl, { left: 0, width: rect.width, right: 'auto' });
      }
    }

    // Show overlay shell
    gsap.set(overlay, { display: 'flex', clipPath: clipMap[active.expandOrigin] });

    const labelEl  = overlay.querySelector('[data-reveal="label"]') as HTMLElement | null;
    const middleEl = overlay.querySelector('[data-reveal="middle"]') as HTMLElement | null;
    const nameEl   = overlay.querySelector('[data-reveal="name"]')  as HTMLElement | null;
    const circleEls = overlay.querySelectorAll<HTMLElement>('[data-expand-circle]');
    // Already opacity:0 from JSX, but also kill any leftover GSAP state
    gsap.set([labelEl, middleEl, nameEl], { opacity: 0 });
    gsap.set(circleEls, { opacity: 0, scale: 0.7, transformOrigin: 'center center' });

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!labelEl || !middleEl || !nameEl) return;

        const vw = window.innerWidth;

        // Measure overlay text at their CSS final positions
        const labelRect = labelEl.getBoundingClientRect();
        const nameRect  = nameEl.getBoundingClientRect();

        // Measure the real column hover elements — gives pixel-perfect start Y
        const colLabelEl   = colLabelRefs.current[active.id];
        const colNameEl    = colNameRefs.current[active.id];
        const colLabelRect = colLabelEl?.getBoundingClientRect();
        const colNameRect  = colNameEl?.getBoundingClientRect();

        // Y delta from overlay-final-position → column-hover-position
        const labelYStart = colLabelRect
          ? colLabelRect.top - labelRect.top
          : 0;
        const nameYStart = colNameRect
          ? colNameRect.top - nameRect.top
          : 0;

        expandOffsetRef.current = { labelY: labelYStart, nameY: nameYStart };

        gsap.set(labelEl,  { y: labelYStart, opacity: 1 });
        gsap.set(nameEl,   { y: nameYStart,  opacity: 1 });
        gsap.set(middleEl, { opacity: 0, y: 12 });

        const tl = gsap.timeline();

        // Expand the real imageClip and overlay clip-path in lock-step.
        // The dark overlay div tracks the column position as imageClip grows left.
        if (rect) {
          tl.to(clipEl, { left: 0, right: 0, width: vw, duration: 0.75, ease: 'power3.inOut' }, 0);
          if (darkOverlayEl) {
            // As imageClip shifts left by rect.left, push overlay right by the same amount
            // so it stays over the original column area.
            tl.to(darkOverlayEl, { left: rect.left, duration: 0.75, ease: 'power3.inOut' }, 0);
          }
        }
        tl.to(overlay, { clipPath: 'inset(0 0% 0 0%)', duration: 0.75, ease: 'power3.inOut' }, 0)
          .to(labelEl,  { y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.4')
          .to(nameEl,   { y: 0, duration: 0.65, ease: 'power3.out' }, '<')
          .to(middleEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25')
          .to(circleEls, {
            opacity: 1, scale: 1,
            duration: 0.7, stagger: 0.12, ease: 'power3.out',
          }, '-=0.45');
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ── Close handler ───────────────────────────────────────────────────── */
  const handleClose = useCallback(() => {
    const overlay = expandedRef.current;
    if (!overlay || !active) return;
    window.dispatchEvent(new CustomEvent('nav:show'));

    const clipEl         = clipRefs.current[active.id];
    const darkOverlayEl  = darkOverlayRefs.current[active.id];
    const rect           = expandColRectRef.current;
    const labelEl        = overlay.querySelector('[data-reveal="label"]') as HTMLElement | null;
    const middleEl       = overlay.querySelector('[data-reveal="middle"]') as HTMLElement | null;
    const nameEl         = overlay.querySelector('[data-reveal="name"]')  as HTMLElement | null;
    const circleEls      = overlay.querySelectorAll<HTMLElement>('[data-expand-circle]');
    const closingId      = active.id;
    const { labelY, nameY } = expandOffsetRef.current;

    const tl = gsap.timeline();

    // 1. Fade out body+CTA + circles, animate label/name back to hover positions
    tl.to(middleEl, { opacity: 0, y: 12, duration: 0.2, ease: 'power2.in' })
      .to(circleEls, { opacity: 0, scale: 0.7, duration: 0.3, stagger: 0.05, ease: 'power2.in' }, '<')
      .to(labelEl,  { y: labelY, duration: 0.5, ease: 'power3.in' }, '<0.05')
      .to(nameEl,   { y: nameY,  duration: 0.5, ease: 'power3.in' }, '<');

    // 2. Contract imageClip and overlay clip-path in lock-step
    if (clipEl && rect) {
      tl.to(clipEl, { left: rect.left, width: rect.width, duration: 0.65, ease: 'power3.inOut' }, '-=0.3');
      // Reverse the dark overlay tracking — shift it back to left:0 as imageClip contracts
      if (darkOverlayEl) {
        tl.to(darkOverlayEl, { left: 0, duration: 0.65, ease: 'power3.inOut' }, '<');
      }
    }
    tl.to(overlay, {
      clipPath: clipMap[active.expandOrigin],
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        if (clipEl) gsap.set(clipEl, { clearProps: 'position,left,top,width,height,zIndex' });
        if (darkOverlayEl) gsap.set(darkOverlayEl, { clearProps: 'left,right,width' });
        const panelEl = overlay.querySelector('[data-expand-panel]') as HTMLElement | null;
        if (panelEl) { panelEl.style.left = ''; panelEl.style.width = ''; }
        gsap.set(overlay, { display: 'none' });
        isExpandedRef.current = false;
        setActive(null);
        if (scrollCloseRef.current) {
          window.removeEventListener('wheel',     scrollCloseRef.current);
          window.removeEventListener('touchmove', scrollCloseRef.current);
          scrollCloseRef.current = null;
        }
        if (hoveredColRef.current !== closingId) runLeave(closingId);
      },
    }, clipEl && rect ? '<' : '-=0.3');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ── Keep ref to latest handleClose so scroll listeners can invoke it ── */
  useEffect(() => { closeHandlerRef.current = handleClose; }, [handleClose]);

  /* ── Escape key ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <section ref={sectionRef} data-snap-section="categories" className={styles.section}>
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`${styles.column} ${overlayIds.has(cat.id) ? styles.columnHovered : ''}`}
            onMouseEnter={() => handleEnter(cat.id)}
            onMouseLeave={() => handleLeave(cat.id)}
            onClick={() => handleClick(cat)}
            role="button"
            tabIndex={0}
            aria-label={`View ${cat.name}`}
            onKeyDown={e => e.key === 'Enter' && handleClick(cat)}
            data-col-id={cat.id}
          >
            <div
              ref={el => { clipRefs.current[cat.id] = el; }}
              className={styles.imageClip}
            >
              <div
                className={styles.hoverImage}
                style={{ backgroundImage: cat.imageSrc ? `url(${cat.imageSrc})` : undefined }}
              />
              <div ref={el => { darkOverlayRefs.current[cat.id] = el; }} className={styles.darkOverlay} />
              <div ref={el => { curtainRefs.current[cat.id] = el; }} className={styles.curtain} />
            </div>
            <span ref={el => { colLabelRefs.current[cat.id] = el; }} className={styles.label}>
              {CAT_KEYS[cat.id] ? t(CAT_KEYS[cat.id].label) : cat.label}
            </span>
            <span ref={el => { colNameRefs.current[cat.id] = el; }} className={styles.name}>
              {CAT_KEYS[cat.id] ? t(CAT_KEYS[cat.id].sub) : cat.name}
            </span>
          </div>
        ))}
      </section>

      {/* Expanded overlay — clicking image area (outside panel) closes via bubble */}
      <div ref={expandedRef} className={styles.expanded} style={{ display: 'none' }} onClick={handleClose}>
        {active && (
          <>
            {/* Circular project images — positioned per origin, sit on the photo backdrop */}
            <div className={`${styles.expandedImages} ${styles[`expandedImagesOrigin_${active.expandOrigin}`]}`} aria-hidden="true">
              {(FEATURED.find(f => f.id === active.id)?.projects.slice(0, 3) ?? []).map((p, i) => (
                <div
                  key={p.id}
                  data-expand-circle
                  className={`${styles.expandedCircle} ${styles[`expandedCircle${i + 1}`]}`}
                  style={{ backgroundImage: `url(${p.imageSrc})` }}
                />
              ))}
            </div>
            <div
              data-expand-panel
              className={`${styles.expandedPanel} ${
                active.expandOrigin === 'left'  ? styles.expandedPanelLeft  :
                active.expandOrigin === 'right' ? styles.expandedPanelRight :
                                                  styles.expandedPanelCenter
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.expandedBlur} />
              <div className={styles.expandedContent}>
                <h3 data-reveal="label" className={styles.expandedLabel} style={{ opacity: 0 }}>{active.label}</h3>
                <div data-reveal="middle" className={styles.expandedMiddle} style={{ opacity: 0 }}>
                  <p className={styles.expandedBody}>{active.body}</p>
                  <a href={active.ctaHref} className={styles.expandedCta}>
                    {active.cta} <span>→</span>
                  </a>
                </div>
                <span data-reveal="name" className={styles.expandedName} style={{ opacity: 0 }}>{active.name}</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
              <span /><span />
            </button>
          </>
        )}
      </div>
    </>
  );
}
