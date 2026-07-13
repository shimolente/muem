import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ResidencesGrid }  from '@/components/ResidencesGrid/ResidencesGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedProperties } from '@/lib/queries/properties';
import { getCategories } from '@/lib/queries/categories';

export const metadata: Metadata = { title: 'Properties' };
export const dynamic  = 'force-dynamic';

export default async function ResidencesPage() {
  const [projects, categories] = await Promise.all([
    getPublishedProperties(),
    getCategories('PROPERTY'),
  ]);
  const categoryLabels = categories.map((c) => c.label);
  return (
    <div data-palette="properties">
      <CategoryHero
        category="Properties"
        headline="Properties"
        imageSrc="/images/residences-cover.jpg"
      />
      <ResidencesGrid projects={projects} categories={categoryLabels} />
      <ContactSection />
    </div>
  );
}
