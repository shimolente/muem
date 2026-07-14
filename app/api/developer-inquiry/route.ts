/**
 * POST /api/developer-inquiry
 *   Public endpoint — receives leads from the "Contact the developer" modal on
 *   property detail pages.
 *   1. Validates input
 *   2. Persists as a ContactSubmission with kind = DEVELOPER
 *   3. Sends Resend notification to admin (best-effort, non-blocking)
 *
 * Mirrors /api/contact: same crude in-memory per-IP rate limit. The submission
 * is captured server-side so the lead is recorded even though the visitor then
 * continues the conversation on WhatsApp.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactNotification } from '@/lib/email';

const schema = z.object({
  name:          z.string().min(1).max(120),
  email:         z.string().email().max(200),
  phone:         z.string().min(3).max(40),
  propertySlug:  z.string().min(1).max(200),
  propertyTitle: z.string().min(1).max(200),
});

const recentByIp = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_IN_WINDOW = 5;

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const list = (recentByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_IN_WINDOW) return false;
  list.push(now);
  recentByIp.set(ip, list);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ ok: false, error: 'TOO_MANY_REQUESTS' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'VALIDATION_FAILED', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, phone, propertySlug, propertyTitle } = parsed.data;
  const lookingFor = 'Property inquiry';
  const message = `Interested in ${propertyTitle}. Requested to contact the developer (continued on WhatsApp).`;

  try {
    const submission = await prisma.contactSubmission.create({
      data: {
        kind: 'DEVELOPER',
        name,
        email,
        phone,
        lookingFor,
        message,
        propertySlug,
        propertyTitle,
      },
    });

    // Email is best-effort — don't fail the request if Resend is misconfigured
    sendContactNotification({
      name, email, phone, lookingFor, message, propertyTitle,
      kind: 'developer',
      submittedAt: submission.createdAt,
    }).catch((e) => {
      console.error('[developer-inquiry] notify failed', e);
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[developer-inquiry] persistence failed', e);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
