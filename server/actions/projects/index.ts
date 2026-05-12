'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';
import { projectSchema, type ProjectInput } from './schema';

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function mapInputToData(input: ProjectInput) {
  return {
    slug:        input.slug,
    title:       input.title,
    subtitle:    input.subtitle ?? null,
    description: input.description ?? null,
    location:    input.location ?? null,
    topology:    input.topology ?? null,
    category:    input.category ?? null,
    size:        input.size ?? null,
    year:        input.year ?? null,
    status:      input.status,
    featured:    input.featured,
    images:      input.images,
    publishedAt: input.published ? new Date() : null,
  };
}

export async function createProject(raw: ProjectInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // New items go to the bottom of the list
    const last = await prisma.studioProject.findFirst({
      where:   { deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select:  { sortOrder: true },
    });
    const project = await prisma.studioProject.create({
      data: { ...mapInputToData(parsed.data), sortOrder: (last?.sortOrder ?? -1) + 1 },
    });
    revalidatePath('/admin/projects');
    revalidatePath('/studio');
    return { ok: true, data: { id: project.id } };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[createProject]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function updateProject(
  id: string,
  raw: ProjectInput,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_FAILED',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.studioProject.update({
      where: { id },
      data:  mapInputToData(parsed.data),
    });
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath('/studio');
    return { ok: true, data: undefined };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, error: 'Slug already in use' };
    }
    console.error('[updateProject]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    await prisma.studioProject.update({
      where: { id },
      data:  { deletedAt: new Date() },
    });
    revalidatePath('/admin/projects');
    revalidatePath('/studio');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[deleteProject]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}

/** Swap sortOrder with adjacent project (in the active, non-deleted set). */
export async function moveProject(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'UNAUTHORIZED' };
  requireAdmin(session.user.role);

  try {
    const current = await prisma.studioProject.findFirst({ where: { id, deletedAt: null } });
    if (!current) return { ok: false, error: 'NOT_FOUND' };

    const neighbour = await prisma.studioProject.findFirst({
      where: {
        deletedAt: null,
        sortOrder: direction === 'up' ? { lt: current.sortOrder } : { gt: current.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });
    if (!neighbour) return { ok: true, data: undefined };

    await prisma.$transaction([
      prisma.studioProject.update({ where: { id: current.id },   data: { sortOrder: neighbour.sortOrder } }),
      prisma.studioProject.update({ where: { id: neighbour.id }, data: { sortOrder: current.sortOrder } }),
    ]);

    revalidatePath('/admin/projects');
    revalidatePath('/studio');
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('[moveProject]', e);
    return { ok: false, error: 'INTERNAL_ERROR' };
  }
}
