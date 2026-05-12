import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FurnitureDetail } from '@/components/FurnitureDetail/FurnitureDetail';
import { ContactSection } from '@/components/ContactSection/ContactSection';
import { getFurnitureBySlug, getPublishedFurniture, getFurnitureSlugs } from '@/lib/queries/furniture';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getFurnitureSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getFurnitureBySlug(slug);
  if (!item) return { title: 'Not Found' };
  return { title: `${item.name} — Habitus` };
}

export default async function FurnitureDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getFurnitureBySlug(slug);
  if (!item) notFound();

  const all = await getPublishedFurniture();
  const related = [
    ...all.filter((i) => i.id !== item.id && i.category === item.category),
    ...all.filter((i) => i.id !== item.id && i.category !== item.category),
  ].slice(0, 4);

  return (
    <>
      <FurnitureDetail item={item} related={related} />
      <ContactSection />
    </>
  );
}
