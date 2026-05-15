'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { deleteEntityFolder } from '@/lib/storage';
import { furnitureSchema, type FurnitureInput } from './schema';

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function mapInputToData(input: FurnitureInput) {
  return {
    slug:        input.slug,
    name:        input.name,
    collection:  input.collection  || null,
    category:    input.category,
    material:    input.material    || null,
    price:       input.price       || null,
    subtitle:    input.subtitle    || null,
    description: input.description || null,
    dimensions:  input.dimensions  || null,
    finish:      input.finish      || null,
    leadTime:    input.leadTime    || null,
    origin:      input.origin      || null,
    featured:    input.featured,
    images:      input.images,
    publishedAt: input.published ? new Date() : null,
  };
}

export async function createFurniture(raw: FurnitureInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = furnitureSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const last = await prisma.furniture.findFirst({
      where:   { deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select:  { sortOrder: true },
    });
    const f = await prisma.furniture.create({
      data: {
        ...mapInputToData(parsed.data),
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    revalidatePath('/admin/furniture');
    revalidatePath('/habitus');
    return { ok: true, data: { id: f.id } };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[createFurniture]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function updateFurniture(
  id: string,
  raw: FurnitureInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = furnitureSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.furniture.update({ where: { id }, data: mapInputToData(parsed.data) });
    revalidatePath('/admin/furniture');
    revalidatePath(`/admin/furniture/${id}`);
    revalidatePath('/habitus');
    return { ok: true, data: undefined };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[updateFurniture]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteFurniture(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    await prisma.furniture.update({
      where: { id },
      data:  { deletedAt: new Date() },
    });
    revalidatePath('/admin/furniture');
    revalidatePath('/habitus');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[deleteFurniture]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

/** Hard-delete + Storage cleanup. Requires prior soft-delete. */
export async function purgeFurniture(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    const row = await prisma.furniture.findUnique({ where: { id } });
    if (!row) return { ok: false, error: 'NOT_FOUND' };
    if (!row.deletedAt) return { ok: false, error: 'MUST_SOFT_DELETE_FIRST' };

    await prisma.furniture.delete({ where: { id } });
    await deleteEntityFolder(`furniture/${id}`);

    revalidatePath('/admin/furniture');
    revalidatePath('/habitus');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[purgeFurniture]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function moveFurniture(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    const current = await prisma.furniture.findFirst({ where: { id, deletedAt: null } });
    if (!current) return { ok: false, error: 'NOT_FOUND' };

    const neighbour = await prisma.furniture.findFirst({
      where: {
        deletedAt: null,
        sortOrder: direction === 'up' ? { lt: current.sortOrder } : { gt: current.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });
    if (!neighbour) return { ok: true, data: undefined };

    await prisma.$transaction([
      prisma.furniture.update({ where: { id: current.id },   data: { sortOrder: neighbour.sortOrder } }),
      prisma.furniture.update({ where: { id: neighbour.id }, data: { sortOrder: current.sortOrder } }),
    ]);

    revalidatePath('/admin/furniture');
    revalidatePath('/habitus');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[moveFurniture]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
