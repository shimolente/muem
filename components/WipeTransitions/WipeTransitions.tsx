'use client';

import { useEffect } from 'react';
import styles from './WipeTransitions.module.css';

const WIPE_MS = 820;
const WHEEL_THRESHOLD = 20;
const TOUCH_THRESHOLD = 42;
// After a snap finishes, swallow leftover trackpad inertia for this long so a
// decaying gesture can't immediately re-cross the threshold and skip a section.
// Fixed window — unlike the old momentum guard it can't extend indefinitely.
const INERTIA_COOLDOWN_MS = 260;
const EXCLUDE = new Set(['hero', 'about', 'footer']);

function freezeHoverInto(clone: HTMLElement, originals: Element[]) {
  if (!originals.length) return;
  const cloneNodes = clone.querySelectorAll<HTMLElement>('[data-wipe-hover-idx]');
  cloneNodes.forEach(node => {
    const idx = Number(node.dataset.wipeHoverIdx);
    const orig = originals[idx] as HTMLElement | undefined;
    if (!orig) return;
    const cs = getComputedStyle(orig);
    node.style.transform = cs.transform;
    node.style.opacity = cs.opacity;
    node.style.filter = cs.filter;
    node.style.borderRadius = cs.borderRadius;
    node.style.background = cs.background;
    node.style.boxShadow = cs.boxShadow;
    node.style.transition = 'none';
  });
}

export function WipeTransitions() {
  useEffect(() => {
    // Desktop-only scroll hijack. On mobile (touch) the wheel/touch capture
    // fights native momentum and nested horizontal scrollers (Featured,
    // Philosophy) — so we don't bind it there. Mobile uses native scroll;
    // section panels are sized in CSS. Re-evaluated on breakpoint change.
    const mql = window.matchMedia('(max-width: 768px)');
    let teardown: (() => void) | null = null;

    function bindDesktop() {
      const getSections = () =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-snap-section]'));

      let isSnapping = false;
      let wheelDelta = 0;
      let wheelTimer: ReturnType<typeof setTimeout> | undefined;
      let touchStartY = 0;
      let cooldownUntil = 0; // swallow inertia until this timestamp after a snap

      // Let native scroll through only when the hovered field actually has
      // scrollable content of its own (a tall textarea, or an explicit
      // opt-out). A single-line input/select has nothing to scroll internally,
      // so hijacking still needs to fire there — otherwise wheeling with the
      // cursor merely resting over a form field silently skips the section
      // wipe and falls back to plain native scroll.
      function wantsNativeScroll(target: HTMLElement | null): boolean {
        const el = target?.closest<HTMLElement>('input,select,textarea,[data-allow-scroll]');
        if (!el) return false;
        if (el.matches('[data-allow-scroll]')) return true;
        return el.scrollHeight > el.clientHeight;
      }

      function currentIndex() {
        const sections = getSections();
        return sections.reduce(
          (best, s, i) => {
            const d = Math.abs(s.getBoundingClientRect().top);
            return d < best.d ? { i, d } : best;
          },
          { i: 0, d: Infinity }
        ).i;
      }

      function createOverlay(from: HTMLElement, direction: 1 | -1) {
        document.querySelectorAll('.' + styles.layer).forEach(el => el.remove());

        // Tag hovered descendants so we can restore their look in the clone
        const hovered = Array.from(from.querySelectorAll(':hover')) as HTMLElement[];
        hovered.forEach((el, i) => { el.dataset.wipeHoverIdx = String(i); });

        const layer = document.createElement('div');
        const capture = document.createElement('div');
        const clone = from.cloneNode(true) as HTMLElement;

        // Cleanup markers on originals
        hovered.forEach(el => { delete el.dataset.wipeHoverIdx; });

        // Apply frozen hover styles inside clone
        freezeHoverInto(clone, hovered);

        clone.removeAttribute('id');
        clone.removeAttribute('data-snap-section');
        clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
        clone.querySelectorAll('[data-wipe-hover-idx]').forEach(n =>
          n.removeAttribute('data-wipe-hover-idx')
        );
        // freeze any videos in the clone to avoid double playback cost
        clone.querySelectorAll('video').forEach(v => {
          (v as HTMLVideoElement).pause();
          (v as HTMLVideoElement).removeAttribute('autoplay');
        });

        capture.className = styles.capture;

        // If the outgoing section is transparent, the live hero video bg is
        // what was visible behind it. Don't move or clone it — raise its
        // z-index so it paints above incoming sections (which would otherwise
        // occlude it after the scroll jump), and apply the same clip-path
        // animation so it wipes in sync with the overlay.
        const fromBg = getComputedStyle(from).backgroundColor;
        const isTransparent =
          fromBg === 'rgba(0, 0, 0, 0)' || fromBg === 'transparent';
        const heroBgRoot = document.querySelector<HTMLElement>('[data-hero-bg]');
        let heroAnim: Animation | null = null;
        let heroRestore: { z: string; willChange: string; clipPath: string } | null = null;
        if (isTransparent && heroBgRoot) {
          heroRestore = {
            z: heroBgRoot.style.zIndex,
            willChange: heroBgRoot.style.willChange,
            clipPath: heroBgRoot.style.clipPath,
          };
          heroBgRoot.style.zIndex = '60';
          heroBgRoot.style.willChange = 'clip-path';
          heroBgRoot.style.clipPath = 'inset(0 0 0 0)';
          const keyframes: Keyframe[] =
            direction > 0
              ? [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }]
              : [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }];
          heroAnim = heroBgRoot.animate(keyframes, {
            duration: WIPE_MS,
            easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
            fill: 'forwards',
          });
        }

        capture.appendChild(clone);

        layer.className =
          styles.layer + ' ' + (direction > 0 ? styles.down : styles.up);
        layer.appendChild(capture);

        document.body.appendChild(layer);
        setTimeout(() => {
          if (heroRestore && heroBgRoot) {
            heroAnim?.cancel();
            heroBgRoot.style.zIndex = heroRestore.z;
            heroBgRoot.style.willChange = heroRestore.willChange;
            heroBgRoot.style.clipPath = heroRestore.clipPath;
          }
          layer.remove();
        }, WIPE_MS + 80);
      }

      function snapTo(targetIdx: number) {
        if (isSnapping) return;
        const sections = getSections();
        if (!sections.length) return;

        const from = currentIndex();
        const to = Math.max(0, Math.min(targetIdx, sections.length - 1));
        if (to === from) {
          wheelDelta = 0;
          return;
        }

        const fromSection = sections[from];
        const toSection = sections[to];
        const direction: 1 | -1 = to > from ? 1 : -1;
        const fromKey = fromSection.dataset.snapSection ?? '';
        const toKey = toSection.dataset.snapSection ?? '';
        const skipWipe = EXCLUDE.has(fromKey) || EXCLUDE.has(toKey);

        isSnapping = true;
        const html = document.documentElement;
        const prevSnap = html.style.scrollSnapType;
        html.style.scrollSnapType = 'none';

        if (!skipWipe) createOverlay(fromSection, direction);
        toSection.scrollIntoView({
          behavior: skipWipe ? 'smooth' : 'auto',
          block: 'start',
        });

        const duration = skipWipe ? 700 : WIPE_MS + 80;
        // Release the lock strictly when the transition ends — never extend it
        // with momentum (that made the page feel stuck for ~1s+ after every
        // snap). Overshoot from decaying inertia is instead absorbed by a fixed
        // cooldown window in onWheel, so a deliberate scroll always responds.
        setTimeout(() => {
          html.style.scrollSnapType = prevSnap;
          isSnapping = false;
          wheelDelta = 0;
          cooldownUntil = performance.now() + INERTIA_COOLDOWN_MS;
        }, duration);
      }

      function onWheel(e: WheelEvent) {
        const t = e.target as HTMLElement | null;
        if (wantsNativeScroll(t)) return;
        // Always intercept — even for EXCLUDE'd transitions — so a single
        // gesture can't bleed across boundaries (e.g. about→categories
        // momentum triggering categories→featured wipe mid-flight).
        e.preventDefault();
        if (isSnapping) return;
        // Absorb decaying inertia right after a snap without triggering another.
        if (performance.now() < cooldownUntil) {
          wheelDelta = 0;
          return;
        }
        wheelDelta += e.deltaY;
        clearTimeout(wheelTimer);
        // Longer idle reset than before (240ms) so a gentle trackpad scroll has
        // time to accumulate past the threshold instead of decaying to 0.
        wheelTimer = setTimeout(() => {
          wheelDelta = 0;
        }, 240);
        if (Math.abs(wheelDelta) < WHEEL_THRESHOLD) return;
        snapTo(currentIndex() + Math.sign(wheelDelta));
      }

      function onTouchStart(e: TouchEvent) {
        touchStartY = e.touches[0].clientY;
      }
      function onTouchMove(e: TouchEvent) {
        const t = e.target as HTMLElement | null;
        if (wantsNativeScroll(t)) return;
        e.preventDefault();
      }
      function onTouchEnd(e: TouchEvent) {
        if (isSnapping) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(dy) < TOUCH_THRESHOLD) return;
        snapTo(currentIndex() + (Math.sign(dy) as 1 | -1));
      }
      function onKey(e: KeyboardEvent) {
        const down = ['ArrowDown', 'PageDown', ' '];
        const up = ['ArrowUp', 'PageUp'];
        if (![...down, ...up].includes(e.key)) return;
        const t = e.target as HTMLElement | null;
        if (t?.closest('input,select,textarea')) return;
        e.preventDefault();
        if (isSnapping) return;
        snapTo(currentIndex() + (down.includes(e.key) ? 1 : -1));
      }

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('keydown', onKey);

      return () => {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('keydown', onKey);
        clearTimeout(wheelTimer);
        document.querySelectorAll('.' + styles.layer).forEach(el => el.remove());
      };
    }

    function sync() {
      if (mql.matches) {
        // Mobile: hand control back to native scroll.
        teardown?.();
        teardown = null;
        document.documentElement.style.scrollSnapType = '';
        document.querySelectorAll('.' + styles.layer).forEach(el => el.remove());
        return;
      }
      if (!teardown) teardown = bindDesktop();
    }

    sync();
    mql.addEventListener('change', sync);

    return () => {
      mql.removeEventListener('change', sync);
      teardown?.();
    };
  }, []);

  return null;
}
