/**
 * Public-site read helpers for Studio Projects.
 * Maps Prisma rows → the consumer interface used by /studio components.
 */

import { prisma } from '@/lib/prisma';
import { imageUrl } from '@/lib/imageUrl';
import type { StudioProject } from '@/content/studio';
import type { StudioProject as DbStudioProject, ProjectStatus, ProjectCategory } from '@prisma/client';

/** DB enum → legacy free-text status used by the existing UI. */
function mapStatus(s: ProjectStatus): string {
  return s === 'InProgress' ? 'In Progress' : s;
}

function toUi(row: DbStudioProject): StudioProject {
  return {
    id:          row.slug,                    // grid uses .id as a stable React key + filter handle
    title:       row.title,
    location:    row.location ?? '',
    topology:    row.topology ?? '',
    size:        row.size ?? '',
    year:        row.year ?? 0,
    status:      mapStatus(row.status),
    subtitle:    row.subtitle ?? undefined,
    description: row.description ?? undefined,
    // Cover URL pre-composed at md for grid use; full images[] stays as
    // raw base paths so detail-page consumers can pick their own size via
    // lib/imageUrl#imageUrl.
    imageSrc:    row.images[0] ? imageUrl(row.images[0], 'md') : '/images/studio-cover.jpg',
    images:      row.images.length ? row.images : ['/images/studio-cover.jpg'],
    featured:    row.featured,
    href:        `/studio/${row.slug}`,
  };
}

export async function getPublishedStudioProjects(
  filter?: { category?: ProjectCategory },
): Promise<StudioProject[]> {
  const rows = await prisma.studioProject.findMany({
    where: {
      deletedAt: null,
      publishedAt: { not: null },
      ...(filter?.category ? { category: filter.category } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });
  return rows.map(toUi);
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Residential',
  'Hospitality',
  'Commercial',
  'FoodAndBeverage',
  'Retail',
];

export function parseCategoryParam(raw: unknown): ProjectCategory | undefined {
  if (typeof raw !== 'string') return undefined;
  return PROJECT_CATEGORIES.find(c => c === raw);
}

export async function getStudioProjectBySlug(slug: string): Promise<StudioProject | null> {
  const row = await prisma.studioProject.findFirst({
    where: { slug, deletedAt: null, publishedAt: { not: null } },
  });
  return row ? toUi(row) : null;
}

export async function getStudioSlugs(): Promise<string[]> {
  const rows = await prisma.studioProject.findMany({
    where:  { deletedAt: null, publishedAt: { not: null } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
