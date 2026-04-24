'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { CATEGORIES, type Category } from '@/content/categories';
import { useUIStore } from '@/store/ui';
import styles from './CategoriesSection.module.css';

type ColState = 'idle' | 'entering' | 'visible' | 'exiting';

export function CategoriesSection() {
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
  const preventScrollRef   = useRef<((e: Event) => void) | null>(null);

  const setNavTheme          = useUIStore(s => s.setNavTheme);
  const setNavStyle          = useUIStore(s => s.setNavStyle);
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
    // Lift curtain immediately — image visible from start so rounded clip has contrast
    gsap.set(curtain, { y: '-101%' });
    // y: full duration — clip slides up and settles
    gsap.fromTo(clip,
      { y: '101%' },
      {
        y: '0%', duration: 1.1, ease: 'power4.out',
        onComplete: () => {
          stateRef.current[id] = 'visible';
          if (pendingRef.current[id] === 'leave') {
            pendingRef.current[id] = null;
            runLeave(id);
          }
        },
      },
    );
    // Top corners only (bottom never visible coming from below)
    // Shorter duration so clip is already sharp before it fully lands
    gsap.fromTo(clip,
      { borderTopLeftRadius: '400px', borderTopRightRadius: '400px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' },
      { borderTopLeftRadius: '0px',    borderTopRightRadius: '0px',    duration: 0.72, ease: 'power2.out' },
    );
  }

  function runLeave(id: string) {
    const clip    = clipRefs.current[id];
    const curtain = curtainRefs.current[id];
    if (!clip || !curtain) return;
    const wasEntering = stateRef.current[id] === 'entering';
    stateRef.current[id] = 'exiting';
    // Kill any in-progress enter animations
    gsap.killTweensOf([clip, curtain]);
    // Fully lift the curtain so the image (not a white box) is visible during exit
    gsap.set(curtain, { y: '-101%' });
    // If interrupted mid-entry, snap clip to fully-arrived position first
    if (wasEntering) gsap.set(clip, { y: '0%', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' });
    // Remove overlay class so text fades in parallel with the exit
    setOverlayIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    // Bottom corners only (top never visible as it exits upward), short delay so rounding trails the motion
    gsap.to(clip, {
      borderBottomLeftRadius: '9999px', borderBottomRightRadius: '9999px',
      borderTopLeftRadius: '0px',       borderTopRightRadius: '0px',
      duration: 0.5, ease: 'power2.in', delay: 0.1,
    });
    // y: clip exits upward
    gsap.to(clip, {
      y: '-101%',
      duration: 0.75,
      ease: 'power3.inOut',
      onComplete: () => {
        // Reset to enter-ready state: top corners rounded, bottom sharp
        gsap.set(clip,    { y: '101%', borderTopLeftRadius: '9999px', borderTopRightRadius: '9999px', borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px' });
        gsap.set(curtain, { y: '0%' }); // reset curtain for next enter
        stateRef.current[id] = 'idle';
        // Restore logo/hamburger color once the clip is fully gone
        const origin = getOrigin(id);
        if (origin === 'left')  setNavLogoLight(false);
        if (origin === 'right') setNavHamburgerLight(false);
        if (pendingRef.current[id] === 'enter') {
          pendingRef.current[id] = null;
          runEnter(id);
        }
      },
    });
  }

  /* ── Hover dispatchers ───────────────────────────────────────────────── */
  const handleEnter = (id: string) => {
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
    hoveredColRef.current = null;
    if (isExpandedRef.current) return;
    const state = stateRef.current[id] ?? 'idle';
    if (state === 'idle' || state === 'exiting') {
      pendingRef.current[id] = null; // cancel any queued enter
      return;
    }
    if (state === 'entering') {
      // Let the enter finish, then exit — prevents the snap from interrupting mid-slide
      pendingRef.current[id] = 'leave';
      return;
    }
    // state === 'visible' — exit immediately
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
          setNavTheme('dark');
          setNavStyle('minimal');
          setNavHamburgerLight(false);
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
  }, [setNavTheme, setNavStyle]);

  /* ── Expand handler ──────────────────────────────────────────────────── */
  const handleExpand = (cat: Category) => {
    // Prevent scrolling by blocking wheel/touch events — avoids touching overflow CSS
    // which would remove the scrollbar and cause layout shifts on the navbar + columns.
    const preventScroll = (e: Event) => e.preventDefault();
    preventScrollRef.current = preventScroll;
    window.addEventListener('wheel',     preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
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
    // Already opacity:0 from JSX, but also kill any leftover GSAP state
    gsap.set([labelEl, middleEl, nameEl], { opacity: 0 });

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
          .to(middleEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
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
    const closingId      = active.id;
    const { labelY, nameY } = expandOffsetRef.current;

    const tl = gsap.timeline();

    // 1. Fade out body+CTA, animate label/name back to hover positions
    tl.to(middleEl, { opacity: 0, y: 12, duration: 0.2, ease: 'power2.in' })
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
        if (preventScrollRef.current) {
          window.removeEventListener('wheel',     preventScrollRef.current);
          window.removeEventListener('touchmove', preventScrollRef.current);
          preventScrollRef.current = null;
        }
        if (hoveredColRef.current !== closingId) runLeave(closingId);
      },
    }, clipEl && rect ? '<' : '-=0.3');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
            onClick={() => handleExpand(cat)}
            role="button"
            tabIndex={0}
            aria-label={`View ${cat.name}`}
            onKeyDown={e => e.key === 'Enter' && handleExpand(cat)}
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
            <span ref={el => { colLabelRefs.current[cat.id] = el; }} className={styles.label}>{cat.label}</span>
            <span ref={el => { colNameRefs.current[cat.id] = el; }} className={styles.name}>{cat.name}</span>
          </div>
        ))}
      </section>

      {/* Expanded overlay — clicking image area (outside panel) closes via bubble */}
      <div ref={expandedRef} className={styles.expanded} style={{ display: 'none' }} onClick={handleClose}>
        {active && (
          <>
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
