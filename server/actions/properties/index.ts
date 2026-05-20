'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { deleteEntityFolder } from '@/lib/storage';
import { propertySchema, type PropertyInput } from './schema';

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function mapInputToData(input: PropertyInput) {
  return {
    slug:        input.slug,
    title:       input.title,
    subtitle:    input.subtitle    || null,
    description: input.description || null,
    location:    input.location    || null,
    topology:    input.topology,
    size:        input.size || null,
    year:        input.year,
    status:      input.status,
    priceFrom:   input.priceFrom || null,
    bedrooms:    input.bedrooms,
    bathrooms:   input.bathrooms,
    carPort:     input.carPort,
    unitsTotal:  input.unitsTotal,
    unitsSold:   input.unitsSold,
    featured:    input.featured,
    images:      input.images,
    publishedAt: input.published ? new Date() : null,
  };
}

export async function createProperty(raw: PropertyInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const last = await prisma.property.findFirst({
      where:   { deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select:  { sortOrder: true },
    });
    const property = await prisma.property.create({
      data: {
        ...mapInputToData(parsed.data),
        ...(parsed.data.id ? { id: parsed.data.id } : {}),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: { id: property.id } };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[createProperty]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function updateProperty(
  id: string,
  raw: PropertyInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.property.update({
      where: { id },
      data:  mapInputToData(parsed.data),
    });
    revalidatePath('/admin/properties');
    revalidatePath(`/admin/properties/${id}`);
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[updateProperty]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    await prisma.property.update({
      where: { id },
      data:  { deletedAt: new Date() },
    });
    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[deleteProperty]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

/** Hard-delete + Storage cleanup. Requires prior soft-delete. */
export async function purgeProperty(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    const row = await prisma.property.findUnique({ where: { id } });
    if (!row) return { ok: false, error: 'NOT_FOUND' };
    if (!row.deletedAt) return { ok: false, error: 'MUST_SOFT_DELETE_FIRST' };

    await prisma.property.delete({ where: { id } });
    await deleteEntityFolder(`properties/${id}`);

    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[purgeProperty]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function reorderProperties(ids: string[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.property.update({ where: { id }, data: { sortOrder: i } }),
      ),
    );
    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[reorderProperties]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function bulkDeleteProperties(ids: string[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);
  if (ids.length === 0) return { ok: true, data: undefined };

  try {
    await prisma.property.updateMany({
      where: { id: { in: ids } },
      data:  { deletedAt: new Date() },
    });
    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[bulkDeleteProperties]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function bulkSetPropertiesPublished(
  ids: string[],
  published: boolean,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);
  if (ids.length === 0) return { ok: true, data: undefined };

  try {
    await prisma.property.updateMany({
      where: { id: { in: ids } },
      data:  { publishedAt: published ? new Date() : null },
    });
    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[bulkSetPropertiesPublished]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function moveProperty(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    const current = await prisma.property.findFirst({ where: { id, deletedAt: null } });
    if (!current) return { ok: false, error: 'NOT_FOUND' };

    const neighbour = await prisma.property.findFirst({
      where: {
        deletedAt: null,
        sortOrder: direction === 'up' ? { lt: current.sortOrder } : { gt: current.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });
    if (!neighbour) return { ok: true, data: undefined };

    await prisma.$transaction([
      prisma.property.update({ where: { id: current.id },   data: { sortOrder: neighbour.sortOrder } }),
      prisma.property.update({ where: { id: neighbour.id }, data: { sortOrder: current.sortOrder } }),
    ]);

    revalidatePath('/admin/properties');
    revalidatePath('/residences');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[moveProperty]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
