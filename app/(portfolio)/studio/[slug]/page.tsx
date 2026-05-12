import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/ProjectDetail/ProjectDetail';
import { ContactSection } from '@/components/ContactSection/ContactSection';
import { getStudioProjectBySlug, getPublishedStudioProjects, getStudioSlugs } from '@/lib/queries/studio';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getStudioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) return { title: 'Project Not Found' };
  return { title: `${project.title} — Studio` };
}

export default async function StudioProjectPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) notFound();

  /* Prefer same topology, fall back to any other project */
  const all = await getPublishedStudioProjects();
  const related = [
    ...all.filter((p) => p.id !== project.id && p.topology === project.topology),
    ...all.filter((p) => p.id !== project.id && p.topology !== project.topology),
  ].slice(0, 4);

  return (
    <>
      <ProjectDetail project={project} related={related} />
      <ContactSection />
    </>
  );
}
