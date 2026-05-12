import type { Metadata } from 'next';
import { CategoryHero }    from '@/components/CategoryHero/CategoryHero';
import { ServicesSection } from '@/components/ServicesSection/ServicesSection';
import { StudioGrid }      from '@/components/StudioGrid/StudioGrid';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPublishedStudioProjects } from '@/lib/queries/studio';

export const metadata: Metadata = { title: 'Studio' };
export const dynamic  = 'force-dynamic';

export default async function StudioPage() {
  const projects = await getPublishedStudioProjects();
  return (
    <>
      <CategoryHero
        category="Studio"
        headline={"From Concept\nto Reality"}
        tagline="our projects."
        imageSrc="/images/studio-cover.jpg"
      />
      <StudioGrid projects={projects} />
      <ServicesSection navStyle="minimal" />
      <ContactSection />
    </>
  );
}
