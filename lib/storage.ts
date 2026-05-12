/**
 * Supabase Storage helpers — server-side only.
 *
 * Bucket: `media` (public read).
 * Create it in Supabase dashboard: Storage → New bucket → name `media`, public ✓.
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

/**
 * Upload a buffer to the `media` bucket.
 * @param path  Storage path within the bucket (e.g. "uploads/abc123.webp")
 * @param body  File buffer / Blob
 * @param contentType MIME type for served file
 * @returns Public URL
 */
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
