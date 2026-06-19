import styles from './PageSkeleton.module.css';

/* ── Listing-page skeleton ─────────────────────────────────────────────────
   Rendered by route-segment loading.tsx while a force-dynamic page awaits its
   DB query, so navigation feels instant. Plain CSS Modules (public site = no
   Tailwind) — a hero block, a filter row, and a responsive square card grid
   that mirrors the real grids (4 → 3 → 2 columns). */
export function PageSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={`${styles.hero} ${styles.shimmer}`} />

      <div className={styles.bar}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`${styles.chip} ${styles.shimmer}`} />
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: cards }).map((_, i) => (
          <span key={i} className={`${styles.card} ${styles.shimmer}`} />
        ))}
      </div>
    </div>
  );
}
