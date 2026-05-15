/**
 * Client-safe URL builder for Supabase Storage images.
 *
 * DB stores BASE PATHS (no host, no size suffix, no extension), e.g.
 *   projects/clx1234/cover-image
 *
 * Renderers compose the public URL on read with `imageUrl(base, size)`.
 * Size variants are produced server-side by the upload route:
 *   {base}-sm.webp  (640w)
 *   {base}-md.webp  (1200w)
 *   {base}-lg.webp  (1920w)
 *
 * Backward-compat: if the stored value already looks like a full URL or
 * a leading-slash public asset path, it is returned as-is. Lets pre-
 * migration data render without breaking.
 */

export type ImageSize = 'sm' | 'md' | 'lg';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const BUCKET = 'media';

export function imageUrl(value: string | null | undefined, size: ImageSize = 'md'): string {
  if (!value) return '';
  // Pass-through: legacy data already storing absolute URLs / `/images/...`
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) return value;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${value}-${size}.webp`;
}

/** First image, sized — convenience for cover thumbnails. */
export function coverUrl(images: string[] | null | undefined, size: ImageSize = 'md'): string {
  if (!images?.length) return '';
  return imageUrl(images[0], size);
}

/**
 * Generate a 16-char hex id for draft entities (matches the SAFE_ID guard
 * in /api/upload/image and the projectSchema.id format). Used by admin
 * forms so a new record's images can be uploaded to its final folder
 * before the record is persisted.
 */
export function makeDraftId(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 8; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
