import type { Metadata } from 'next';
import { CategoryHero }  from '@/components/CategoryHero/CategoryHero';
import { FurnitureGrid } from '@/components/FurnitureGrid/FurnitureGrid';
import { ContactSection } from '@/components/ContactSection/ContactSection';
import { getPublishedFurniture } from '@/lib/queries/furniture';

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Muem Studio furniture collections — pieces to complete your perfect spaces.',
};
export const dynamic = 'force-dynamic';

export default async function HabitusPage() {
  const items = await getPublishedFurniture();
  return (
    <div data-palette="furniture">
      <CategoryHero
        category="Lifestyle"
        headline={"Your Own Space,\nThe Way You Want"}
        tagline="our collections."
        imageSrc="/images/habitus-cover.jpg"
      />
      <FurnitureGrid items={items} />
      <ContactSection />
    </div>
  );
}
