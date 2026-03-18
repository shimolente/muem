'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Cursor.module.css';

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    const onMove = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none', overwrite: true });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.45, ease: 'power3.out', overwrite: true });
    };

    const onEnterLink = () => {
      gsap.to(ring, { scale: 1.8, duration: 0.3, ease: 'power2.out' });
      gsap.to(dot,  { scale: 0,   duration: 0.2 });
    };

    const onLeaveLink = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(dot,  { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    const bindLinks = () => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink);
        el.addEventListener('mouseleave', onLeaveLink);
      });
    };

    bindLinks();
    const observer = new MutationObserver(bindLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
    </>
  );
}
