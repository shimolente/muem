'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';

const SNAP_DURATION    = 0.42; // seconds for the snap-to animation
const SETTLE_DELAY     = 30;   // ms after Lenis scroll stops before snapping
/* Only snap when within this distance of a target section.
   55 % of the viewport height keeps homepage 100svh sections snapping correctly
   (they're always ≤50vh apart) while preventing inner pages (Studio etc.) from
   snapping back when the user is browsing deep inside a scrollable section. */
/* 60 % keeps homepage sections (≤50vh apart) snapping, without firing
   prematurely when the user is barely scrolling on a longer inner page.      */
const MAX_SNAP_DISTANCE = () => window.innerHeight * 0.6;

function getSections() {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-snap-section]'),
  );
}

function getNearestSection(sections: HTMLElement[]) {
  const scrollY = window.scrollY;
  return sections.reduce((prev, curr) =>
    Math.abs(curr.offsetTop - scrollY) < Math.abs(prev.offsetTop - scrollY)
      ? curr
      : prev,
  );
}

/**
 * Creates Lenis, drives the RAF loop, and handles section snapping.
 *
 * Strategy:
 *  - Lenis smoothWheel: true  → smooth, natural feel on mouse + trackpad
 *  - On every Lenis scroll event we reset a short debounce timer
 *  - When the timer fires (scroll settled) we snap to the nearest
 *    [data-snap-section] via lenis.scrollTo() with GSAP-style easing
 *  - No wheel interception, no CSS snap — Lenis owns everything
 */
export function LenisProvider() {
  useEffect(() => {
    const isTouch = !window.matchMedia('(hover: hover)').matches;

    const lenis = new Lenis({
      duration:    0.7,   // inertia length — shorter = snappier feel
      smoothWheel: !isTouch,
    });

    setLenis(lenis);

    let raf: number;
    let snapTimer: ReturnType<typeof setTimeout>;
    let snapping = false;

    if (!isTouch) {
      lenis.on('scroll', () => {
        if (snapping) return;
        clearTimeout(snapTimer);

        snapTimer = setTimeout(() => {
          if (snapping) return;
          const sections = getSections();
          if (!sections.length) return;

          const nearest  = getNearestSection(sections);
          const distance = Math.abs(nearest.offsetTop - window.scrollY);
          if (distance < 5) return;                         // already there
          if (distance > MAX_SNAP_DISTANCE()) return;       // too far — no snap

          /* One-way sections (data-snap-one-way="down") snap INTO the section
             from above, but never pull the user BACK to the section top when
             they are already browsing inside it (scrollY > section top).     */
          if (
            nearest instanceof HTMLElement &&
            nearest.dataset.snapOneWay === 'down' &&
            window.scrollY > nearest.offsetTop
          ) return;

          snapping = true;
          lenis.scrollTo(nearest, {
            duration: SNAP_DURATION,
            easing:   (t: number) => 1 - Math.pow(1 - t, 3), // ease-out-cubic
            onComplete: () => { snapping = false; },
          });

          // Fallback reset in case onComplete doesn't fire
          setTimeout(() => { snapping = false; }, (SNAP_DURATION + 0.2) * 1000);
        }, SETTLE_DELAY);
      });
    }

    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(snapTimer);
      lenis.destroy();
      setLenis(null as never);
    };
  }, []);

  return null;
}
