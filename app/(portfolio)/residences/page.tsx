import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ResidencesGrid }  from '@/components/ResidencesGrid/ResidencesGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedProperties } from '@/lib/queries/properties';
import { getCategories } from '@/lib/queries/categories';
import reveal from '@/components/ContactReveal/ContactReveal.module.css';

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
      <div className={reveal.above}>
        <CategoryHero
          category="Properties"
          headline={"Design &\nInvestment."}
          tagline="curated real estate."
          imageSrc="/images/residences-cover.jpg"
        />
        <ResidencesGrid projects={projects} categories={categoryLabels} />
      </div>
      <div className={reveal.target}>
        <ContactSection />
      </div>
    </div>
  );
}
