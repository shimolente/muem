/**
 * Supabase Storage helpers — server-side only.
 *
 * Bucket: `media` (public read).
 * Create it in Supabase dashboard: Storage → New bucket → name `media`, public ✓.
 *
 * Path convention (set by /api/upload/image):
 *   {entityType}/{entityId}/{cuid}-{size}.webp
 *   entityType ∈ projects | properties | furniture
 *   size       ∈ sm | md | lg
 *
 * DB stores the BASE path without size/extension:
 *   projects/abc123/cover
 * Renderers call lib/imageUrl#imageUrl(base, size) to compose a public URL.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET        = 'media';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn('[storage] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

/** Size variants produced for every uploaded image. */
export const IMAGE_SIZES = [
  { key: 'sm', width: 640 },
  { key: 'md', width: 1200 },
  { key: 'lg', width: 1920 },
] as const;

export type ImageSizeKey = (typeof IMAGE_SIZES)[number]['key'];

/* ── Single-file upload (legacy / generic) ───────────────────────────────── */

export async function uploadToStorage(
  path: string,
  body: ArrayBuffer | Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert:   false,
    cacheControl: '31536000',
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return getPublicUrl(path);
}

export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('[storage.delete]', error);
}

/* ── Multi-size variants ─────────────────────────────────────────────────── */

/**
 * Upload all three size variants for a base path. Caller supplies one buffer
 * per size in `variants` (keys: sm | md | lg). Returns the base path so the
 * caller can persist it to the DB.
 */
export async function uploadImageVariants(
  basePath: string,
  variants: Record<ImageSizeKey, Buffer>,
): Promise<string> {
  await Promise.all(
    IMAGE_SIZES.map(({ key }) =>
      supabase.storage
        .from(BUCKET)
        .upload(`${basePath}-${key}.webp`, variants[key], {
          contentType: 'image/webp',
          upsert: false,
          cacheControl: '31536000',
        })
        .then(({ error }) => {
          if (error) throw new Error(`Upload ${key} failed: ${error.message}`);
        }),
    ),
  );
  return basePath;
}

/** Remove all three variants for a base path. Best-effort, errors logged. */
export async function deleteImageVariants(basePath: string): Promise<void> {
  const paths = IMAGE_SIZES.map(({ key }) => `${basePath}-${key}.webp`);
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error('[storage.deleteImageVariants]', basePath, error);
}

/**
 * Recursively list and remove every file under `prefix` (e.g. `projects/abc`).
 * Used when an entity is hard-deleted so its uploads don't outlive it.
 */
export async function deleteEntityFolder(prefix: string): Promise<void> {
  const trimmed = prefix.replace(/\/+$/, '');
  const { data, error } = await supabase.storage.from(BUCKET).list(trimmed, {
    limit: 1000,
  });
  if (error) {
    console.error('[storage.deleteEntityFolder list]', prefix, error);
    return;
  }
  if (!data?.length) return;

  const paths = data.map((f) => `${trimmed}/${f.name}`);
  const { error: rmError } = await supabase.storage.from(BUCKET).remove(paths);
  if (rmError) console.error('[storage.deleteEntityFolder remove]', prefix, rmError);
}
