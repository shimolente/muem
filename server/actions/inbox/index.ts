'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';

type ActionResult = { ok: true } | { ok: false; error: string };

async function gate() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');
  requireAdmin(session.user.role);
}

export async function markRead(id: string, read: boolean): Promise<ActionResult> {
  try {
    await gate();
    await prisma.contactSubmission.update({ where: { id }, data: { read } });
    revalidatePath('/admin/inbox');
    revalidatePath('/admin/dashboard');
    return { ok: true };
  } catch (e) {
    console.error('[markRead]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function markReplied(id: string): Promise<ActionResult> {
  try {
    await gate();
    await prisma.contactSubmission.update({
      where: { id },
      data:  { repliedAt: new Date(), read: true },
    });
    revalidatePath('/admin/inbox');
    revalidatePath('/admin/dashboard');
    return { ok: true };
  } catch (e) {
    console.error('[markReplied]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  try {
    await gate();
    await prisma.contactSubmission.delete({ where: { id } });
    revalidatePath('/admin/inbox');
    revalidatePath('/admin/dashboard');
    return { ok: true };
  } catch (e) {
    console.error('[deleteSubmission]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
