/**
 * ── Muem reveal animation system ─────────────────────────────────────────
 *
 * Global pattern: elements enter rounded, snap sharp on arrival.
 * For elements with overflow:hidden (cards, images), the border-radius
 * visually clips the content as the element moves in — creating a
 * rounded crop that sharpens as it lands.
 *
 * Usage:
 *   import { revealUp, revealFade } from '@/lib/animation';
 *
 *   revealUp(cards, { stagger: 0.08 });
 *   revealFade(image, { delay: 0.3 });
 */

import gsap from 'gsap';

/** Radius at start of entrance — matches CSS --radius-enter */
const ENTER_RADIUS = '20px';
const DURATION     = 0.7;
const EASE         = 'power3.out';

/**
 * Reveal element(s) from below.
 * Animates: opacity 0→1, y 40→0, borderRadius ENTER_RADIUS→0
 */
export function revealUp(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(targets, { opacity: 1, y: 0, borderRadius: '0px' }) as gsap.core.Tween;
  }
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 40, borderRadius: ENTER_RADIUS },
    {
      opacity: 1,
      y: 0,
      borderRadius: '0px',
      duration: DURATION,
      ease: EASE,
      ...vars,
    },
  );
}

/**
 * Reveal element(s) with a fade + subtle scale.
 * Animates: opacity 0→1, scale 0.96→1, borderRadius ENTER_RADIUS→0
 */
export function revealFade(
  targets: gsap.TweenTarget,
  vars: gsap.TweenVars = {},
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    return gsap.set(targets, { opacity: 1, scale: 1, borderRadius: '0px' }) as gsap.core.Tween;
  }
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: 0.96, borderRadius: ENTER_RADIUS },
    {
      opacity: 1,
      scale: 1,
      borderRadius: '0px',
      duration: DURATION,
      ease: EASE,
      ...vars,
    },
  );
}

/**
 * Set initial hidden state before an entrance animation fires.
 * Call this synchronously (not in a setTimeout/rAF) before the observer.
 */
export function setHidden(targets: gsap.TweenTarget): void {
  gsap.set(targets, { opacity: 0, y: 40, borderRadius: ENTER_RADIUS });
}

/**
 * True when the user has asked the OS to reduce motion. Use to skip GSAP
 * entrances/loops and jump straight to the final visible state. SSR-safe
 * (returns false when `window`/`matchMedia` are unavailable).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
