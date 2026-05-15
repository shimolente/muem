/**
 * Defer nav-state updates (theme/style/logo) until the WipeTransitions
 * controller's clip animation has finished. IntersectionObserver fires at
 * the start of the wipe (after the instant scrollIntoView jump); applying
 * the new navbar look immediately makes the change feel "ahead" of the
 * visual transition. Holding the update until the wipe overlay is gone
 * keeps the navbar in sync with what the user actually sees.
 *
 * One global pending timer — a newer call cancels an older one, so the
 * most recently entered section wins.
 */

const WIPE_MS = 820;
let pending: ReturnType<typeof setTimeout> | null = null;

export function scheduleNavUpdate(apply: () => void, delay = WIPE_MS) {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    apply();
  }, delay);
}

export function cancelPendingNavUpdate() {
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
}
