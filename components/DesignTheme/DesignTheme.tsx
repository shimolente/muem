'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Reads ?design=v1|v2 from the URL and applies data-design to <html>.
 * CSS vars in global.css respond to [data-design="v2"] to switch the palette.
 * Must be wrapped in <Suspense> at the call site (Next.js App Router requirement).
 */
export function DesignTheme() {
  const params = useSearchParams();
  const design = params.get('design') === 'v2' ? 'v2' : 'v1';

  useEffect(() => {
    document.documentElement.setAttribute('data-design', design);
    return () => {
      document.documentElement.removeAttribute('data-design');
    };
  }, [design]);

  return null;
}
