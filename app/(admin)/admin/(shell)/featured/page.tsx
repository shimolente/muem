import { prisma } from '@/lib/prisma';
import { FeaturedColumn } from './featured-column';
import { SiteHeader } from '@/components/admin/site-header';
import { FEATURED_MAX_PER_CATEGORY } from '@/lib/featured';
import type { FeaturedCategory } from '@prisma/client';

export const metadata = { title: 'Featured Projects' };
export const dynamic  = 'force-dynamic';

const CATEGORIES: { id: FeaturedCategory; label: string; tagline: string }[] = [
  { id: 'Residential', label: 'Residential', tagline: 'Architecture at the intersection of craft and vision.' },
  { id: 'Hospitality', label: 'Hospitality', tagline: 'Living spaces crafted for the way you actually live.'   },
  { id: 'Commercial',  label: 'Commercial',  tagline: 'Private residences conceived from the inside out.'      },
];

export default async function FeaturedPage() {
  // Fetch all slots + all candidate projects in one round-trip
  const [slots, projects] = await Promise.all([
    prisma.featuredSlot.findMany({
      include: { project: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    }),
    prisma.studioProject.findMany({
      where:   { deletedAt: null },
      orderBy: [{ title: 'asc' }],
      select:  { id: true, title: true, location: true },
    }),
  ]);

  return (
    <>
    <SiteHeader title="Featured Projects" />
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <p className="text-sm text-muted-foreground">
        Pick which Studio Projects appear in each homepage tab. Drag the handle to reorder.
        Up to {FEATURED_MAX_PER_CATEGORY} per category.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const inCategory  = slots.filter((s) => s.category === c.id);
          const usedIds     = new Set(inCategory.map((s) => s.projectId));
          const available   = projects.filter((p) => !usedIds.has(p.id));
          return (
            <FeaturedColumn
              key={c.id}
              category={c.id}
              label={c.label}
              tagline={c.tagline}
              slots={inCategory.map((s) => ({
                id:       s.id,
                title:    s.project.title,
                location: s.project.location,
              }))}
              available={available}
              max={FEATURED_MAX_PER_CATEGORY}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}
