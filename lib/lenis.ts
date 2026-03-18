import type Lenis from 'lenis';

/**
 * Module-level singleton — lets any client component access
 * the Lenis instance without React context overhead.
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis) { instance = l; }
export function getLenis(): Lenis | null { return instance; }
