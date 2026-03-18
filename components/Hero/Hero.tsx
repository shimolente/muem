'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO } from '@/content/hero';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef   = useRef<HTMLElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Word reveal
      const words = headlineRef.current?.querySelectorAll('[data-word]') ?? [];
      gsap.fromTo(words,
        { y: '110%', opacity: 0 },
        { y: '0%', opacity: 1, stagger: 0.1, duration: 1.1, ease: 'power3.out', delay: 0.3 },
      );

      // Scroll indicator fade-in
      gsap.fromTo(scrollIndRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.2 },
      );

      // Video parallax
      if (videoRef.current) {
        gsap.to(videoRef.current, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Scroll indicator fades out as user scrolls
      gsap.to(scrollIndRef.current, {
        opacity: 0,
        y: -10,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '15% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = HERO.headline.split(' ');

  // Build overlay style from CMS values
  const overlayHex = Math.round(HERO.overlayOpacity * 255).toString(16).padStart(2, '0');
  const overlayStyle = {
    background: `linear-gradient(to top, ${HERO.overlayColor}CC 0%, ${HERO.overlayColor}00 50%), ${HERO.overlayColor}${overlayHex}`,
  };

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          src={HERO.videoSrc}
          poster={HERO.videoPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      <div className={styles.overlay} style={overlayStyle} aria-hidden="true" />

      <div className={styles.contentBottom}>
        <h1 ref={headlineRef} className={styles.headline}>
          {words.map((word, i) => (
            <span key={i} className={styles.wordClip}>
              <span data-word style={{ display: 'inline-block' }}>
                {word}{i < words.length - 1 ? '\u00A0' : ''}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div ref={scrollIndRef} className={styles.scrollIndicator} aria-label="Scroll down">
        <span className={styles.scrollLabel}>{HERO.scrollLabel}</span>
        <div className={styles.scrollLine}>
          <div className={styles.scrollLineFill} />
        </div>
      </div>
    </section>
  );
}
