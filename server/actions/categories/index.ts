'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import type { CategoryKind } from '@prisma/client';

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const KIND = z.enum(['STUDIO', 'PROPERTY', 'FURNITURE']);

async function gate() {
  const session = await auth();
  if (!session?.user) throw new Error('UNAUTHORIZED');
  requireAdmin(session.user.role);
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Public route to revalidate when a kind's categories change. */
function publicPath(kind: CategoryKind): string {
  return kind === 'STUDIO' ? '/studio' : kind === 'PROPERTY' ? '/residences' : '/habitus';
}

/** Count entities currently assigned to a category label (for delete guard). */
async function countUsage(kind: CategoryKind, label: string): Promise<number> {
  if (kind === 'STUDIO')   return prisma.studioProject.count({ where: { category: label, deletedAt: null } });
  if (kind === 'PROPERTY') return prisma.property.count({ where: { topology: label, deletedAt: null } });
  return prisma.furniture.count({ where: { category: label, deletedAt: null } });
}

/** Rewrite entity rows from an old label to a new one (rename cascade). */
async function cascadeRename(kind: CategoryKind, oldLabel: string, newLabel: string): Promise<void> {
  if (kind === 'STUDIO') {
    await prisma.studioProject.updateMany({ where: { category: oldLabel }, data: { category: newLabel } });
  } else if (kind === 'PROPERTY') {
    await prisma.property.updateMany({ where: { topology: oldLabel }, data: { topology: newLabel } });
  } else {
    await prisma.furniture.updateMany({ where: { category: oldLabel }, data: { category: newLabel } });
  }
}

function revalidate(kind: CategoryKind) {
  revalidatePath('/admin/categories');
  revalidatePath(publicPath(kind));
}

export async function createCategory(rawKind: CategoryKind, rawLabel: string): Promise<ActionResult<{ id: string }>> {
  try {
    await gate();
    const kind  = KIND.parse(rawKind);
    const label = rawLabel.trim();
    if (!label) return { ok: false, error: 'Label is required' };
    const slug = slugify(label);
    if (!slug) return { ok: false, error: 'Label must contain letters or numbers' };

    const existing = await prisma.category.findUnique({ where: { kind_slug: { kind, slug } } });
    if (existing && !existing.deletedAt) return { ok: false, error: 'Category already exists' };

    const last = await prisma.category.findFirst({ where: { kind }, orderBy: { sortOrder: 'desc' } });
    const sortOrder = (last?.sortOrder ?? -1) + 1;

    // Revive a soft-deleted row with the same slug, else create.
    const row = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: { label, deletedAt: null, sortOrder } })
      : await prisma.category.create({ data: { kind, label, slug, sortOrder } });

    revalidate(kind);
    return { ok: true, data: { id: row.id } };
  } catch (e) {
    console.error('[createCategory]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function updateCategory(id: string, rawLabel: string): Promise<ActionResult> {
  try {
    await gate();
    const label = rawLabel.trim();
    if (!label) return { ok: false, error: 'Label is required' };

    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return { ok: false, error: 'NOT_FOUND' };
    if (cat.label === label) return { ok: true, data: undefined };

    await prisma.$transaction(async (tx) => {
      await tx.category.update({ where: { id }, data: { label } });
    });
    // Cascade outside the txn helpers (separate model calls) so stored labels stay in sync.
    await cascadeRename(cat.kind, cat.label, label);

    revalidate(cat.kind);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[updateCategory]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function reorderCategories(rawKind: CategoryKind, orderedIds: string[]): Promise<ActionResult> {
  try {
    await gate();
    const kind = KIND.parse(rawKind);
    await prisma.$transaction(
      orderedIds.map((id, idx) =>
        prisma.category.update({ where: { id }, data: { sortOrder: idx } }),
      ),
    );
    revalidate(kind);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[reorderCategories]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await gate();
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return { ok: false, error: 'NOT_FOUND' };

    const used = await countUsage(cat.kind, cat.label);
    if (used > 0) {
      return { ok: false, error: `In use by ${used} item${used === 1 ? '' : 's'} — reassign them first` };
    }

    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidate(cat.kind);
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[deleteCategory]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
