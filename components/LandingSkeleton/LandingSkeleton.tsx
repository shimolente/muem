import styles from './LandingSkeleton.module.css';

/* ── Landing-page skeleton ──────────────────────────────────────────────────
   Rendered by app/(portfolio)/loading.tsx while the force-dynamic homepage
   awaits its featured-projects DB query. Plain CSS Modules (public site = no
   Tailwind): a full-viewport hero block + a square featured-bento grid. */
export function LandingSkeleton() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={`${styles.hero} ${styles.shimmer}`}>
        <span className={`${styles.heroLine} ${styles.heroLine1} ${styles.shimmer}`} />
        <span className={`${styles.heroLine} ${styles.heroLine2} ${styles.shimmer}`} />
      </div>

      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`${styles.cell} ${styles.shimmer}`} />
        ))}
      </div>
    </div>
  );
}
