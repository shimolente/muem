import type { Metadata } from 'next';
import { CategoryHero }  from '@/components/CategoryHero/CategoryHero';
import { FurnitureGrid } from '@/components/FurnitureGrid/FurnitureGrid';
import { ContactSection } from '@/components/ContactSection/ContactSection';

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Muem Studio furniture collections — pieces to complete your perfect spaces.',
};

export default function HabitusPage() {
  return (
    <>
      <CategoryHero
        category="Lifestyle"
        headline={"Your Own Space,\nThe Way You Want"}
        tagline="our collections."
        imageSrc="/images/habitus-cover.jpg"
      />
      <FurnitureGrid />
      <ContactSection />
    </>
  );
}
