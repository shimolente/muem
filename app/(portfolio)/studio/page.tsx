import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { StudioGrid }      from '@/components/StudioGrid/StudioGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedStudioProjects, parseCategoryParam } from '@/lib/queries/studio';

export const metadata: Metadata = { title: 'Studio' };
export const dynamic  = 'force-dynamic';

type StudioPageProps = {
  searchParams: Promise<{ category?: string }>;
};

// ProjectCategory enum → CategoryDef.id used by StudioGrid filter chips
const CATEGORY_TO_GRID_ID: Record<string, 'residential' | 'hospitality' | 'commercial'> = {
  Residential: 'residential',
  Hospitality: 'hospitality',
  Commercial:  'commercial',
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { category: rawCategory } = await searchParams;
  const category = parseCategoryParam(rawCategory);
  const projects = await getPublishedStudioProjects(category ? { category } : undefined);
  const initialCategoryId = category ? CATEGORY_TO_GRID_ID[category] : undefined;
  return (
    <div data-palette="studio">
      <CategoryHero
        category="Studio"
        headline={"From Concept\nto Reality"}
        tagline="our projects."
        imageSrc="/images/studio-cover.jpg"
      />
      <StudioGrid projects={projects} initialCategoryId={initialCategoryId} />
      <ServicesSection navStyle="minimal" />
      <ContactSection />
    </div>
  );
}
