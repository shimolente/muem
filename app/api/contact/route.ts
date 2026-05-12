/**
 * POST /api/contact
 *   Public endpoint — receives submissions from the homepage / contact page form.
 *   1. Validates input
 *   2. Persists to ContactSubmission
 *   3. Sends Resend notification to admin (best-effort, non-blocking)
 *
 * Crude in-memory rate limit (per Node process) — fine for a small marketing site.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactNotification } from '@/lib/email';
import { CONTACT } from '@/content/contact';

const schema = z.object({
  name:       z.string().min(1).max(120),
  email:      z.string().email().max(200),
  lookingFor: z.string().min(1).max(80),
  message:    z.string().min(5).max(4000),
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

  const allowedNeeds = new Set(CONTACT.needs);
  if (!allowedNeeds.has(parsed.data.lookingFor)) {
    return NextResponse.json({ ok: false, error: 'INVALID_NEED' }, { status: 400 });
  }

  try {
    const submission = await prisma.contactSubmission.create({
      data: parsed.data,
    });

    // Email is best-effort — don't fail the request if Resend is misconfigured
    sendContactNotification({ ...parsed.data, submittedAt: submission.createdAt }).catch((e) => {
      console.error('[contact] notify failed', e);
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact] persistence failed', e);
    return NextResponse.json({ ok: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
