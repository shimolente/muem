import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { StudioGrid }      from '@/components/StudioGrid/StudioGrid';

export const metadata: Metadata = { title: 'Studio' };

export default function StudioPage() {
  return (
    <>
      <CategoryHero
        category="Studio"
        headline={"Design Spaces,\nCreate Home"}
        tagline="We help the most discerning individuals and brands to cut through complexity, enhance lifestyles and exceed business goals."
        imageSrc="/images/studio-cover.jpg"
      />
      <StudioGrid />
      <ServicesSection />
    </>
  );
}
