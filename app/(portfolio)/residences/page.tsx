import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ResidencesGrid }  from '@/components/ResidencesGrid/ResidencesGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';

export const metadata: Metadata = { title: 'Properties' };

export default function ResidencesPage() {
  return (
    <>
      <CategoryHero
        category="Properties"
        headline={"Design &\nInvestment."}
        tagline="curated real estate."
        imageSrc="/images/residences-cover.jpg"
      />
      <ResidencesGrid />
      <ContactSection />
    </>
  );
}
