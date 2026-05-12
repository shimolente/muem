/**
 * POST /api/upload/image
 *   multipart/form-data with field "file"
 *
 * Pipeline:
 *   1. Auth gate (admin only)
 *   2. Validate type/size
 *   3. Sharp: rotate(EXIF), strip metadata, resize to max 1920w, convert WebP q80
 *   4. Upload to Supabase Storage at `uploads/{cuid}.webp`
 *   5. Return { ok: true, url: <public url> }
 */

import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { auth } from '@/lib/auth';
import { uploadToStorage } from '@/lib/storage';

const MAX_BYTES = 12 * 1024 * 1024;       // 12 MB hard cap
const ALLOWED   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'NO_FILE' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'FILE_TOO_LARGE' }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: 'BAD_TYPE' }, { status: 415 });
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Sharp pipeline
    const processed = await sharp(inputBuffer)
      .rotate()                              // honour EXIF orientation, then strip
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const id   = randomBytes(8).toString('hex');
    const path = `uploads/${Date.now()}-${id}.webp`;
    const url  = await uploadToStorage(path, processed, 'image/webp');

    return NextResponse.json({ ok: true, url, path });
  } catch (e) {
    console.error('[upload/image]', e);
    return NextResponse.json({ ok: false, error: 'PROCESSING_FAILED' }, { status: 500 });
  }
}
