import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResidenceDetail } from '@/components/ResidenceDetail/ResidenceDetail';
import { ContactSection }  from '@/components/ContactSection/ContactSection';
import { getPropertyBySlug, getPublishedProperties, getPropertySlugs } from '@/lib/queries/properties';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPropertyBySlug(slug);
  if (!project) return { title: 'Property Not Found' };
  return { title: `${project.title} — Properties` };
}

export default async function ResidenceProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await getPropertyBySlug(slug);
  if (!project) notFound();

  const all = await getPublishedProperties();
  const related = [
    ...all.filter((p) => p.id !== project.id && p.topology === project.topology),
    ...all.filter((p) => p.id !== project.id && p.topology !== project.topology),
  ].slice(0, 4);

  return (
    <div data-palette="properties">
      <ResidenceDetail project={project} related={related} />
      <ContactSection />
    </div>
  );
}
