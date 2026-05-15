/**
 * POST /api/upload/image
 *   multipart/form-data:
 *     file       — image file (jpg/png/webp/heic/heif)
 *     entityType — 'projects' | 'properties' | 'furniture'
 *     entityId   — cuid of the owning record (draft id is fine for new records)
 *
 * Pipeline:
 *   1. Auth gate (admin only)
 *   2. Validate type / size / entityType
 *   3. Sharp: rotate(EXIF) + strip metadata, then three resizes (sm/md/lg)
 *      → three WebPs at q80
 *   4. Upload all three to Supabase at
 *      {entityType}/{entityId}/{cuid}-{size}.webp
 *   5. Return { ok: true, basePath } where basePath is the prefix without
 *      size + extension, e.g. "projects/abc123/def456"
 *
 * Renderers compose URLs via lib/imageUrl#imageUrl(basePath, size).
 */

import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { auth } from '@/lib/auth';
import { IMAGE_SIZES, type ImageSizeKey, uploadImageVariants } from '@/lib/storage';

const MAX_BYTES = 12 * 1024 * 1024;       // 12 MB hard cap
const ALLOWED   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const ENTITY_TYPES = new Set(['projects', 'properties', 'furniture']);
// cuid-ish: alphanumeric, 12–32 chars. Permissive, just guards against
// path-traversal junk being passed as the id.
const SAFE_ID = /^[a-z0-9]{8,32}$/i;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const form = await req.formData();
  const file       = form.get('file');
  const entityType = String(form.get('entityType') ?? '');
  const entityId   = String(form.get('entityId')   ?? '');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'NO_FILE' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'FILE_TOO_LARGE' }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: 'BAD_TYPE' }, { status: 415 });
  }
  if (!ENTITY_TYPES.has(entityType)) {
    return NextResponse.json({ ok: false, error: 'BAD_ENTITY_TYPE' }, { status: 400 });
  }
  if (!SAFE_ID.test(entityId)) {
    return NextResponse.json({ ok: false, error: 'BAD_ENTITY_ID' }, { status: 400 });
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // One Sharp instance reused for the three resizes.
    const base = sharp(inputBuffer).rotate(); // honour EXIF, then strip on encode

    const variants = {} as Record<ImageSizeKey, Buffer>;
    await Promise.all(
      IMAGE_SIZES.map(async ({ key, width }) => {
        variants[key] = await base
          .clone()
          .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
      }),
    );

    const fileId   = randomBytes(8).toString('hex');
    const basePath = `${entityType}/${entityId}/${fileId}`;
    await uploadImageVariants(basePath, variants);

    return NextResponse.json({ ok: true, basePath });
  } catch (e) {
    console.error('[upload/image]', e);
    return NextResponse.json({ ok: false, error: 'PROCESSING_FAILED' }, { status: 500 });
  }
}
