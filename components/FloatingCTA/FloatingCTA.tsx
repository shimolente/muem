'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useUIStore } from '@/store/ui';
import styles from './FloatingCTA.module.css';

type State = 'arrow' | 'pill' | 'snapped' | 'hidden';

export function FloatingCTA() {
  const ctaRef            = useRef<HTMLAnchorElement>(null);
  const iconRef           = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>('arrow');
  const [visible, setVisible] = useState(false);
  const stateRef          = useRef<State>('arrow');
  const hasSnapped        = useRef(false);
  const snapTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navStyle          = useUIStore(s => s.navStyle);
  const floatingArrowHide = useUIStore(s => s.floatingArrowHide);
  const navStyleRef       = useRef(navStyle);

  /* Keep refs in sync (stale-closure guards) */
  useEffect(() => { stateRef.current   = state;    }, [state]);
  useEffect(() => { navStyleRef.current = navStyle; }, [navStyle]);

  /* ── Bounce icon when arrow state is visible, stop otherwise ─────────── */
  useEffect(() => {
    const icon = iconRef.current;
    if (!icon) return;

    if (state === 'arrow' && visible) {
      gsap.to(icon, {
        y: 5,
        duration: 0.75,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      });
    } else {
      gsap.killTweensOf(icon);
      gsap.set(icon, { y: 0 });
    }
  }, [state, visible]);

  /* ── Delayed entrance: show button 1.5s after mount ─────────────────── */
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  /* ── navStyle → arrow / pill ─────────────────────────────────────────── */
  useEffect(() => {
    if (stateRef.current === 'snapped' || stateRef.current === 'hidden') return;
    setState(navStyle === 'minimal' ? 'pill' : 'arrow');
  }, [navStyle]);

  /* ── Snap animation: float → footer CTA btn ─────────────────────────── */
  const doSnap = useCallback(() => {
    if (hasSnapped.current) return;
    const el = ctaRef.current;
    if (!el) return;
    const footerBtn = document.getElementById('footer-cta');
    if (!footerBtn) return;

    hasSnapped.current = true;
    setState('snapped');

    /* Wait 200ms for Lenis to finish decelerating before reading rects.
       The footer-section observer fires at 30% visibility (mid-scroll);
       by 200ms into that we're well into the ease-out deceleration tail. */
    snapTimerRef.current = setTimeout(() => {
      const myRect     = el.getBoundingClientRect();
      const targetRect = footerBtn.getBoundingClientRect();

      /* Switch from CSS bottom/right → top/left so GSAP can tween coords */
      gsap.set(el, {
        bottom: 'auto',
        right:  'auto',
        top:    myRect.top,
        left:   myRect.left,
      });

      gsap.to(el, {
        top:      targetRect.top,
        left:     targetRect.left,
        width:    targetRect.width,
        height:   targetRect.height,
        duration: 0.55,
        ease:     'power3.inOut',
        onComplete: () => setState('hidden'),
      });
    }, 200);
  }, []);

  /* ── Restore when footer leaves viewport ─────────────────────────────── */
  const doRestore = useCallback(() => {
    if (!hasSnapped.current) return;

    /* Cancel any pending snap timer (user scrolled away before 200ms fired) */
    if (snapTimerRef.current !== null) {
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }

    hasSnapped.current = false;
    const el = ctaRef.current;
    if (!el) return;

    gsap.killTweensOf(el);
    /* Clear all inline GSAP-set props so CSS class values re-apply */
    gsap.set(el, { clearProps: 'top,left,width,height,bottom,right,opacity' });

    setState(navStyleRef.current === 'minimal' ? 'pill' : 'arrow');
  }, []);

  /* ── Watch footer SECTION (not just the button) — lower threshold for
     timing accuracy; 200ms delay handles mid-scroll rect reads ─────────── */
  useEffect(() => {
    const footerSection = document.getElementById('footer-marker');
    if (!footerSection) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) doSnap(); else doRestore();
      },
      { threshold: 0.3 },
    );
    obs.observe(footerSection);
    return () => obs.disconnect();
  }, [doSnap, doRestore]);

  /* ── Always render (never return null — required for doRestore to work) */
  const isHidden = state === 'hidden' || (state === 'arrow' && floatingArrowHide);
  const isPill   = state === 'pill' || state === 'snapped';

  return (
    <Link
      ref={ctaRef}
      href="/contact"
      aria-label="Let's talk"
      className={[
        styles.cta,
        isPill   ? styles.pill    : '',
        visible  ? styles.visible : '',
        isHidden ? styles.hidden  : '',
      ].filter(Boolean).join(' ')}
    >
      {isPill && <span className={styles.ctaLabel}>Let's talk</span>}
      <i ref={iconRef} className={styles.ctaIcon}>
        {isPill
          ? <img src="/arrow.svg" alt="" className={styles.ctaArrow} />
          : '↓'}
      </i>
    </Link>
  );
}
