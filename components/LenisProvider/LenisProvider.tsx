'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';

/**
 * LenisProvider
 *
 * - Homepage ( / ): Lenis is NOT active. CSS scroll-snap handles everything.
 *   The <SnapEnabler> component in page.tsx adds the snap class to <body>.
 * - Inner pages (Studio, Habitus, Residences …): Lenis smooth-scroll only,
 *   no snap logic at all.
 */
export function LenisProvider() {
  const pathname   = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    // Landing page uses CSS snap — no Lenis needed
    if (isHomepage) return;

    const isTouch = !window.matchMedia('(hover: hover)').matches;

    const lenis = new Lenis({
      duration:    0.9,
      smoothWheel: !isTouch,
    });

    setLenis(lenis);

    let raf: number;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null as never);
    };
  }, [isHomepage]);

  return null;
}
