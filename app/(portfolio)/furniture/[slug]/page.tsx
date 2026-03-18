import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function FurnitureDetailPage({ params }: Props) {
  const { slug } = await params;
  return <div style={{ paddingTop: '120px', color: 'white', padding: '120px 56px' }}>Furniture: {slug} — coming soon</div>;
}
