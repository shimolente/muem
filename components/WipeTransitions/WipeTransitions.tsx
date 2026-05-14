'use client';

import { useEffect } from 'react';
import styles from './WipeTransitions.module.css';

const WIPE_MS = 820;
const WHEEL_THRESHOLD = 34;
const TOUCH_THRESHOLD = 42;
const EXCLUDE = new Set(['footer']);

export function WipeTransitions() {
  useEffect(() => {
    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-snap-section]'));

    let isSnapping = false;
    let wheelDelta = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let touchStartY = 0;

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

      const layer = document.createElement('div');
      const capture = document.createElement('div');
      const clone = from.cloneNode(true) as HTMLElement;

      clone.removeAttribute('id');
      clone.removeAttribute('data-snap-section');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      // freeze any videos in the clone to avoid double playback cost
      clone.querySelectorAll('video').forEach(v => {
        (v as HTMLVideoElement).pause();
        (v as HTMLVideoElement).removeAttribute('autoplay');
      });

      capture.className = styles.capture;
      capture.appendChild(clone);

      layer.className =
        styles.layer + ' ' + (direction > 0 ? styles.down : styles.up);
      layer.appendChild(capture);

      document.body.appendChild(layer);
      setTimeout(() => layer.remove(), WIPE_MS + 80);
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
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollSnapType = 'none';
      html.style.scrollBehavior = 'auto';

      if (!skipWipe) createOverlay(fromSection, direction);
      toSection.scrollIntoView({ behavior: 'auto', block: 'start' });

      requestAnimationFrame(() => {
        html.style.scrollBehavior = prevBehavior;
        html.style.scrollSnapType = prevSnap;
      });

      setTimeout(
        () => {
          isSnapping = false;
          wheelDelta = 0;
        },
        skipWipe ? 280 : WIPE_MS + 80
      );
    }

    function onWheel(e: WheelEvent) {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input,select,textarea,[data-allow-scroll]')) return;
      e.preventDefault();
      if (isSnapping) return;
      wheelDelta += e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelDelta = 0;
      }, 160);
      if (Math.abs(wheelDelta) < WHEEL_THRESHOLD) return;
      snapTo(currentIndex() + Math.sign(wheelDelta));
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.target as HTMLElement | null;
      if (!t?.closest('input,select,textarea,[data-allow-scroll]')) {
        e.preventDefault();
      }
    }
    function onTouchEnd(e: TouchEvent) {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < TOUCH_THRESHOLD || isSnapping) return;
      snapTo(currentIndex() + Math.sign(dy));
    }
    function onKey(e: KeyboardEvent) {
      const down = ['ArrowDown', 'PageDown', ' '];
      const up = ['ArrowUp', 'PageUp'];
      if (![...down, ...up].includes(e.key)) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input,select,textarea')) return;
      e.preventDefault();
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
  }, []);

  return null;
}
