'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Cursor.module.css';

export function Cursor() {
  const dotRef       = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const labelRef     = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const dot       = dotRef.current!;
    const ring      = ringRef.current!;
    const label     = labelRef.current!;
    const labelText = labelTextRef.current!;

    type Mode = 'normal' | 'link' | 'label';
    let mode: Mode = 'normal';
    const bound = new WeakSet<Element>();

    const setMode = (next: Mode, text?: string) => {
      if (next === mode) return;
      mode = next;
      gsap.killTweensOf(dot,   'scale,opacity');
      gsap.killTweensOf(ring,  'scale,opacity');
      gsap.killTweensOf(label, 'scale,opacity');
      if (next === 'normal') {
        gsap.to(dot,   { scale: 1, opacity: 1, duration: 0.2 });
        gsap.to(ring,  { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(label, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in' });
      } else if (next === 'link') {
        gsap.to(ring,  { scale: 1.8, opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.to(dot,   { scale: 0,   opacity: 0, duration: 0.2 });
        gsap.to(label, { opacity: 0, scale: 0.85, duration: 0.15, ease: 'power2.in' });
      } else if (next === 'label') {
        if (text) labelText.textContent = text;
        gsap.set(labelText, { y: 0 });
        gsap.to(dot,   { scale: 0, opacity: 0, duration: 0.15 });
        gsap.to(ring,  { scale: 0, opacity: 0, duration: 0.15, ease: 'power2.in' });
        gsap.to(label, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    };

    const onMove = (e: MouseEvent) => {
      gsap.to(dot,   { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none', overwrite: 'auto' });
      gsap.to(ring,  { x: e.clientX, y: e.clientY, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(label, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none', overwrite: 'auto' });
    };

    // Custom events fired by CategoriesSection
    const onCursorLabel  = (e: Event) => setMode('label', (e as CustomEvent<string>).detail);
    const onCursorReset  = () => setMode('normal');
    const onCursorSwitch = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      gsap.killTweensOf(labelText, 'y,opacity');
      // Slide current text out upward, new text enters from below
      gsap.to(labelText, {
        y: -18, opacity: 0, duration: 0.18, ease: 'power3.in',
        onComplete: () => {
          labelText.textContent = text;
          gsap.fromTo(labelText,
            { y: 18, opacity: 0 },
            { y: 0,  opacity: 1, duration: 0.4, ease: 'power4.out' },
          );
        },
      });
    };

    const bindLinks = () => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach(el => {
        if (bound.has(el)) return;
        bound.add(el);
        el.addEventListener('mouseenter', () => setMode('link'));
        el.addEventListener('mouseleave', () => setMode('normal'));
      });
    };

    window.addEventListener('mousemove',     onMove,         { passive: true });
    window.addEventListener('cursor:label',  onCursorLabel);
    window.addEventListener('cursor:reset',  onCursorReset);
    window.addEventListener('cursor:switch', onCursorSwitch);

    bindLinks();
    const observer = new MutationObserver(bindLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove',     onMove);
      window.removeEventListener('cursor:label',  onCursorLabel);
      window.removeEventListener('cursor:reset',  onCursorReset);
      window.removeEventListener('cursor:switch', onCursorSwitch);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}   className={styles.dot}         aria-hidden="true" />
      <div ref={ringRef}  className={styles.ring}        aria-hidden="true" />
      <div ref={labelRef} className={styles.cursorLabel} aria-hidden="true">
        <span ref={labelTextRef} />
      </div>
    </>
  );
}
