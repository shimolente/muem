/**
 * Featured projects for the homepage bento grid.
 *
 * Maps the FeaturedSlot rows back into the legacy `FeaturedCategory[]` shape
 * the existing FeaturedSection component expects. Keys (`studio`, `habitus`,
 * `residences`) are used as CSS class lookups for the bento grid layouts —
 * do NOT rename without updating FeaturedSection.module.css.
 */

import { prisma } from '@/lib/prisma';
import { imageUrl } from '@/lib/imageUrl';
import { FEATURED, type FeaturedCategory } from '@/content/featured';

const META: Record<
  'Residential' | 'Hospitality' | 'Commercial',
  { id: 'studio' | 'habitus' | 'residences'; name: string; tagline: string }
> = {
  Residential: { id: 'studio',     name: 'Residential', tagline: 'Architecture at the intersection of craft and vision.' },
  Hospitality: { id: 'habitus',    name: 'Hospitality', tagline: 'Living spaces crafted for the way you actually live.'   },
  Commercial:  { id: 'residences', name: 'Commercial',  tagline: 'Private residences conceived from the inside out.'      },
};

const COVER_BY_CAT: Record<string, string> = {
  studio:     '/images/studio-cover.jpg',
  habitus:    '/images/habitus-cover.jpg',
  residences: '/images/residences-cover.jpg',
};

export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  try {
    const slots = await prisma.featuredSlot.findMany({
      include: { project: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    return (['Residential', 'Hospitality', 'Commercial'] as const).map((dbCat) => {
      const meta = META[dbCat];
      const inCat = slots.filter(
        (s) =>
          s.category === dbCat &&
          s.project.deletedAt === null &&
          s.project.publishedAt !== null, // never surface drafts/unpublished on the public homepage
      );
      return {
        id:      meta.id,
        label:   'Featured projects',
        name:    meta.name,
        tagline: meta.tagline,
        projects: inCat.map((s) => ({
          id:       s.project.slug,
          title:    s.project.title,
          location: s.project.location ?? '',
          imageSrc: s.project.images[0]
            ? imageUrl(s.project.images[0], 'lg')
            : COVER_BY_CAT[meta.id],
          href:     `/studio/${s.project.slug}`,
          category: meta.id,
        })),
      };
    });
  } catch {
    return FEATURED;
  }
}
