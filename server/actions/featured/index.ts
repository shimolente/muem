'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import type { FeaturedCategory } from '@prisma/client';

type ActionResult = { ok: true } | { ok: false; error: string };

const CATEGORY = z.enum(['Residential', 'Hospitality', 'Commercial']);

async function gate() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');
  requireAdmin(session.user.role);
}

export async function addFeatured(category: FeaturedCategory, projectId: string): Promise<ActionResult> {
  try {
    await gate();
    const parsed = CATEGORY.safeParse(category);
    if (!parsed.success) return { ok: false, error: 'INVALID_CATEGORY' };

    // Append to end of list
    const last = await prisma.featuredSlot.findFirst({
      where:   { category },
      orderBy: { sortOrder: 'desc' },
    });
    const nextOrder = (last?.sortOrder ?? -1) + 1;

    await prisma.featuredSlot.create({
      data: { category, projectId, sortOrder: nextOrder },
    });
    revalidatePath('/admin/featured');
    revalidatePath('/');
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Project already featured in this category' };
    }
    console.error('[addFeatured]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function removeFeatured(slotId: string): Promise<ActionResult> {
  try {
    await gate();
    await prisma.featuredSlot.delete({ where: { id: slotId } });
    revalidatePath('/admin/featured');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    console.error('[removeFeatured]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

/** Bulk reorder: pass the desired order of slot IDs within a category. */
export async function reorderFeatured(
  category: FeaturedCategory,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await gate();
    const parsed = CATEGORY.safeParse(category);
    if (!parsed.success) return { ok: false, error: 'INVALID_CATEGORY' };

    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.featuredSlot.update({
          where: { id },
          data:  { sortOrder: idx, category },
        }),
      ),
    );
    revalidatePath('/admin/featured');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    console.error('[reorderFeatured]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function moveFeatured(slotId: string, direction: 'up' | 'down'): Promise<ActionResult> {
  try {
    await gate();
    const slot = await prisma.featuredSlot.findUnique({ where: { id: slotId } });
    if (!slot) return { ok: false, error: 'NOT_FOUND' };

    const neighbour = await prisma.featuredSlot.findFirst({
      where: {
        category:  slot.category,
        sortOrder: direction === 'up' ? { lt: slot.sortOrder } : { gt: slot.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });
    if (!neighbour) return { ok: true };  // already at edge

    // Swap sort orders
    await prisma.$transaction([
      prisma.featuredSlot.update({ where: { id: slot.id },     data: { sortOrder: neighbour.sortOrder } }),
      prisma.featuredSlot.update({ where: { id: neighbour.id }, data: { sortOrder: slot.sortOrder } }),
    ]);

    revalidatePath('/admin/featured');
    revalidatePath('/');
    return { ok: true };
  } catch (e) {
    console.error('[moveFeatured]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
