import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RESIDENCES_PROJECTS } from '@/content/residences';
import { ResidenceDetail } from '@/components/ResidenceDetail/ResidenceDetail';
import { ContactSection }  from '@/components/ContactSection/ContactSection';

export function generateStaticParams() {
  return RESIDENCES_PROJECTS.map(p => ({ slug: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const project = RESIDENCES_PROJECTS.find(p => p.id === slug);
  if (!project) return { title: 'Property Not Found' };
  return { title: `${project.title} — Properties` };
}

export default async function ResidenceProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = RESIDENCES_PROJECTS.find(p => p.id === slug);
  if (!project) notFound();

  /* Prefer same topology, fall back to any other property */
  const related = [
    ...RESIDENCES_PROJECTS.filter(p => p.id !== project.id && p.topology === project.topology),
    ...RESIDENCES_PROJECTS.filter(p => p.id !== project.id && p.topology !== project.topology),
  ].slice(0, 4);

  return (
    <>
      <ResidenceDetail project={project} related={related} />
      <ContactSection />
    </>
  );
}
