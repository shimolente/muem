'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { settingsSchema, type SettingsInput } from './schema';

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateSettings(raw: SettingsInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = {
    socials:         parsed.data.socials,
    coconutsShared:  parsed.data.coconutsShared,
    aboutStats:      parsed.data.aboutStats,
    contactEmail:    parsed.data.contactEmail,
    contactWhatsapp: parsed.data.contactWhatsapp,
    contactLocation: parsed.data.contactLocation,
  };

  try {
    await prisma.siteSettings.upsert({
      where:  { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });

    // Public pages that surface settings
    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/admin/settings');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[updateSettings]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
