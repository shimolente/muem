import { prisma } from '@/lib/prisma';
import { FURNITURE_ITEMS, type FurnitureItem } from '@/content/furniture';
import type { Furniture as DbFurniture } from '@prisma/client';

function toUi(row: DbFurniture): FurnitureItem {
  return {
    id:          row.slug,
    name:        row.name,
    collection:  row.collection ?? '',
    category:    row.category,
    material:    row.material ?? '',
    price:       row.price ?? '',
    images:      row.images.length ? row.images : ['/images/chair.jpg'],
    href:        `/furniture/${row.slug}`,
    featured:    row.featured,
    subtitle:    row.subtitle ?? undefined,
    description: row.description ?? undefined,
    dimensions:  row.dimensions ?? undefined,
    finish:      row.finish ?? undefined,
    leadTime:    row.leadTime ?? undefined,
    origin:      row.origin ?? undefined,
  };
}

export async function getPublishedFurniture(): Promise<FurnitureItem[]> {
  try {
    const rows = await prisma.furniture.findMany({
      where:   { deletedAt: null, publishedAt: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
    return rows.map(toUi);
  } catch {
    return FURNITURE_ITEMS;
  }
}

export async function getFurnitureBySlug(slug: string): Promise<FurnitureItem | null> {
  try {
    const row = await prisma.furniture.findFirst({
      where: { slug, deletedAt: null, publishedAt: { not: null } },
    });
    return row ? toUi(row) : null;
  } catch {
    return FURNITURE_ITEMS.find(i => i.id === slug) ?? null;
  }
}

export async function getFurnitureSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.furniture.findMany({
      where:  { deletedAt: null, publishedAt: { not: null } },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  } catch {
    return FURNITURE_ITEMS.map(i => i.id);
  }
}
