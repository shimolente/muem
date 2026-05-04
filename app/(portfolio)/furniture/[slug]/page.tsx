import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FURNITURE_ITEMS } from '@/content/furniture';
import { FurnitureDetail } from '@/components/FurnitureDetail/FurnitureDetail';
import { ContactSection } from '@/components/ContactSection/ContactSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FURNITURE_ITEMS.map(item => ({ slug: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = FURNITURE_ITEMS.find(i => i.id === slug);
  if (!item) return { title: 'Not Found' };
  return { title: `${item.name} — Habitus` };
}

export default async function FurnitureDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = FURNITURE_ITEMS.find(i => i.id === slug);
  if (!item) notFound();

  /* Same category first, then other items */
  const related = [
    ...FURNITURE_ITEMS.filter(i => i.id !== item.id && i.category === item.category),
    ...FURNITURE_ITEMS.filter(i => i.id !== item.id && i.category !== item.category),
  ].slice(0, 4);

  return (
    <>
      <FurnitureDetail item={item} related={related} />
      <ContactSection />
    </>
  );
}
