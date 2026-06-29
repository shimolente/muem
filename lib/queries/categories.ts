import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { CategoryKind } from '@prisma/client';

export interface CategoryOption {
  id:    string;
  label: string;
  slug:  string;
}

/** Active categories for a content kind, ordered. Request-cached. */
export const getCategories = cache(async (kind: CategoryKind): Promise<CategoryOption[]> => {
  try {
    return await prisma.category.findMany({
      where:   { kind, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select:  { id: true, label: true, slug: true },
    });
  } catch {
    return [];
  }
});

/** Just the label strings — entity columns store the label, so this is the
 *  valid value set used to validate entity input in server actions. */
export async function getCategoryLabels(kind: CategoryKind): Promise<string[]> {
  const cats = await getCategories(kind);
  return cats.map((c) => c.label);
}
