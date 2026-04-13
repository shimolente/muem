import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STUDIO_PROJECTS } from '@/content/studio';
import { ProjectDetail } from '@/components/ProjectDetail/ProjectDetail';
import { ContactSection } from '@/components/ContactSection/ContactSection';

export function generateStaticParams() {
  return STUDIO_PROJECTS.map(p => ({ slug: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const project = STUDIO_PROJECTS.find(p => p.id === slug);
  if (!project) return { title: 'Project Not Found' };
  return { title: `${project.title} — Studio` };
}

export default async function StudioProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = STUDIO_PROJECTS.find(p => p.id === slug);
  if (!project) notFound();

  /* Prefer same topology, fall back to any other project */
  const related = [
    ...STUDIO_PROJECTS.filter(p => p.id !== project.id && p.topology === project.topology),
    ...STUDIO_PROJECTS.filter(p => p.id !== project.id && p.topology !== project.topology),
  ].slice(0, 4);

  return (
    <>
      <ProjectDetail project={project} related={related} />
      <ContactSection />
    </>
  );
}
