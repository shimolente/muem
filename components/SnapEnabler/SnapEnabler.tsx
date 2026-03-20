'use client';

import { useEffect } from 'react';

/**
 * Adds `snap-scroll` class to <body> when mounted (homepage only).
 * CSS in global.css uses this class to enable scroll-snap-type: y mandatory.
 * Removed on unmount so inner pages scroll freely.
 */
export function SnapEnabler() {
  useEffect(() => {
    document.documentElement.classList.add('snap-scroll');
    return () => {
      document.documentElement.classList.remove('snap-scroll');
      // Reset scroll so inner pages always open at the top,
      // not at whatever Y position the homepage footer was at.
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
  }, []);

  return null;
}
