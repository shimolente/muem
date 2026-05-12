import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProjectForm } from '../project-form';
import { DeleteProjectButton } from './delete-button';

export const metadata = { title: 'Edit Studio Project' };
export const dynamic  = 'force-dynamic';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.studioProject.findFirst({
    where: { id, deletedAt: null },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All projects
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{project.title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated {project.updatedAt.toLocaleString()}
          </p>
        </div>
        <DeleteProjectButton id={project.id} title={project.title} />
      </div>

      <ProjectForm
        projectId={project.id}
        initial={{
          slug:        project.slug,
          title:       project.title,
          subtitle:    project.subtitle,
          description: project.description,
          location:    project.location,
          topology:    project.topology,
          category:    project.category,
          size:        project.size,
          year:        project.year,
          status:      project.status,
          featured:    project.featured,
          published:   project.publishedAt !== null,
          images:      project.images,
        }}
      />
    </div>
  );
}
