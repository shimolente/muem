import type { Metadata } from 'next';
import { CategoryHero }  from '@/components/CategoryHero/CategoryHero';
import { FurnitureGrid } from '@/components/FurnitureGrid/FurnitureGrid';
import { ContactSection } from '@/components/ContactSection/ContactSection';
import { getPublishedFurniture } from '@/lib/queries/furniture';
import { getCategories } from '@/lib/queries/categories';
import reveal from '@/components/ContactReveal/ContactReveal.module.css';

export const metadata: Metadata = {
  title: 'Lifestyle',
  description: 'Muem Studio furniture collections — pieces to complete your perfect spaces.',
};
export const dynamic = 'force-dynamic';

export default async function HabitusPage() {
  const [items, categories] = await Promise.all([
    getPublishedFurniture(),
    getCategories('FURNITURE'),
  ]);
  const categoryLabels = categories.map((c) => c.label);
  return (
    <div data-palette="furniture">
      <div className={reveal.above}>
        <CategoryHero
          category="Lifestyle"
          headline="Lifestyle"
          imageSrc="/images/habitus-cover.jpg"
        />
        <FurnitureGrid items={items} categories={categoryLabels} />
      </div>
      <div className={reveal.target}>
        <ContactSection />
      </div>
    </div>
  );
}
