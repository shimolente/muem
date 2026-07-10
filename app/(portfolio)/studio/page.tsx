import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { StudioGrid }      from '@/components/StudioGrid/StudioGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedStudioProjects, parseCategoryParam } from '@/lib/queries/studio';
import { getCategories } from '@/lib/queries/categories';
import reveal from '@/components/ContactReveal/ContactReveal.module.css';

export const metadata: Metadata = { title: 'Studio' };
export const dynamic  = 'force-dynamic';

type StudioPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { category: rawCategory } = await searchParams;
  const initialCategory = parseCategoryParam(rawCategory);
  // Always load the full set — the param only seeds the initial filter so
  // every category stays switchable client-side (no "stuck" dataset).
  const [projects, categories] = await Promise.all([
    getPublishedStudioProjects(),
    getCategories('STUDIO'),
  ]);
  const categoryLabels = categories.map((c) => c.label);
  return (
    <div data-palette="studio">
      <div className={reveal.above}>
        <CategoryHero
          category="Studio"
          headline="Studio"
          imageSrc="/images/studio-cover.jpg"
        />
        <StudioGrid projects={projects} categories={categoryLabels} initialCategory={initialCategory} />
        <ServicesSection navStyle="minimal" />
      </div>
      <div className={reveal.target}>
        <ContactSection />
      </div>
    </div>
  );
}
