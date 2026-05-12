import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ResidencesGrid }  from '@/components/ResidencesGrid/ResidencesGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedProperties } from '@/lib/queries/properties';

export const metadata: Metadata = { title: 'Properties' };
export const dynamic  = 'force-dynamic';

export default async function ResidencesPage() {
  const projects = await getPublishedProperties();
  return (
    <>
      <CategoryHero
        category="Properties"
        headline={"Design &\nInvestment."}
        tagline="curated real estate."
        imageSrc="/images/residences-cover.jpg"
      />
      <ResidencesGrid projects={projects} />
      <ContactSection />
    </>
  );
}
