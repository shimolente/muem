import { prisma } from '@/lib/prisma';
import { imageUrl } from '@/lib/imageUrl';
import type { ResidenceProject } from '@/content/residences';
import type { Property as DbProperty, ProjectStatus } from '@prisma/client';

function mapStatus(s: ProjectStatus): string {
  return s === 'InProgress' ? 'In Progress' : s;
}

function toUi(row: DbProperty): ResidenceProject {
  return {
    id:          row.slug,
    title:       row.title,
    location:    row.location ?? '',
    topology:    row.topology ?? '',  // = admin-managed Category(kind: PROPERTY).label
    size:        row.size ?? '',
    year:        row.year ?? 0,
    status:      mapStatus(row.status),
    subtitle:    row.subtitle ?? undefined,
    description: row.description ?? undefined,
    imageSrc:    row.images[0] ? imageUrl(row.images[0], 'md') : '/images/residences-cover.jpg',
    images:      row.images.length ? row.images : ['/images/residences-cover.jpg'],
    featured:    row.featured,
    href:        `/residences/${row.slug}`,
    unitsTotal:  row.unitsTotal ?? 0,
    unitsSold:   row.unitsSold,
    priceFrom:   row.priceFrom ?? undefined,
    bedrooms:    row.bedrooms ?? undefined,
    bathrooms:   row.bathrooms ?? undefined,
    carPort:     row.carPort ?? undefined,
    developerPhone: row.developerPhone ?? undefined,
  };
}

export async function getPublishedProperties(): Promise<ResidenceProject[]> {
  const rows = await prisma.property.findMany({
    where:   { deletedAt: null, publishedAt: { not: null } },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });
  return rows.map(toUi);
}

export async function getPropertyBySlug(slug: string): Promise<ResidenceProject | null> {
  const row = await prisma.property.findFirst({
    where: { slug, deletedAt: null, publishedAt: { not: null } },
  });
  return row ? toUi(row) : null;
}

export async function getPropertySlugs(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where:  { deletedAt: null, publishedAt: { not: null } },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
