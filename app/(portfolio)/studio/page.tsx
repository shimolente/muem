import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { StudioGrid }      from '@/components/StudioGrid/StudioGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';

export const metadata: Metadata = { title: 'Studio' };

export default function StudioPage() {
  return (
    <>
      <CategoryHero
        category="Studio"
        headline={"From Concept\nto Reality"}
        tagline="our projects."
        imageSrc="/images/studio-cover.jpg"
      />
      <StudioGrid />
      <ServicesSection navStyle="minimal" />
      <ContactSection />
    </>
  );
}
