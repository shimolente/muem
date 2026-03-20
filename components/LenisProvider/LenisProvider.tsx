'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';

const SNAP_DURATION = 0.72; // seconds — smooth but purposeful
const SNAP_COOLDOWN = 900;  // ms — minimum time between snaps (covers animation + settling)

function getSections() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-snap-section]'),
  );
}

/**
 * LenisProvider
 *
 * - Mounts Lenis smooth-scroll on ALL portfolio pages.
 * - Snap logic runs ONLY on the homepage ( pathname === '/' ):
 *     • Intercepts wheel events, prevents native scroll
 *     • Determines direction (deltaY) → finds next/prev [data-snap-section]
 *     • Calls lenis.scrollTo() for a smooth snap — one section per gesture
 *     • SNAP_COOLDOWN prevents rapid-firing during the animation
 * - Inner pages (Studio, Habitus, Residences) scroll freely with Lenis inertia.
 */
export function LenisProvider() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    const isTouch = !window.matchMedia('(hover: hover)').matches;

    const lenis = new Lenis({
      duration:    0.9,
      smoothWheel: !isTouch,
    });

    setLenis(lenis);

    // ── RAF loop ────────────────────────────────────────────────────────────
    let raf: number;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ── Snap (homepage only) ─────────────────────────────────────────────────
    let snapping    = false;
    let lastSnap    = 0;

    function handleWheel(e: WheelEvent) {
      if (!isHomepage || isTouch) return;

      const sections = getSections();
      if (!sections.length) return;

      const now = Date.now();
      if (snapping || now - lastSnap < SNAP_COOLDOWN) return;

      // Find which section we're currently at (closest to top of viewport)
      const scrollY = window.scrollY;
      let currentIdx = 0;
      let minDist = Infinity;
      sections.forEach((s, i) => {
        const d = Math.abs(s.offsetTop - scrollY);
        if (d < minDist) { minDist = d; currentIdx = i; }
      });

      const goingDown = e.deltaY > 0;
      const targetIdx = goingDown
        ? Math.min(currentIdx + 1, sections.length - 1)
        : Math.max(currentIdx - 1, 0);

      const target = sections[targetIdx];
      // Already at section top (within 4px) and no further section in this direction
      if (targetIdx === currentIdx && minDist < 4) return;

      e.preventDefault();
      snapping  = true;
      lastSnap  = now;

      lenis.scrollTo(target, {
        duration: SNAP_DURATION,
        easing:   (t: number) => 1 - Math.pow(1 - t, 4), // ease-out-quart
        onComplete: () => { snapping = false; },
      });

      // Safety reset in case onComplete doesn't fire
      setTimeout(() => { snapping = false; }, (SNAP_DURATION + 0.3) * 1000);
    }

    if (!isTouch && isHomepage) {
      // passive: false is required to call preventDefault()
      window.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', handleWheel);
      lenis.destroy();
      setLenis(null as never);
    };
  // Re-run when navigating between homepage ↔ inner pages
  }, [isHomepage]);

  return null;
}
