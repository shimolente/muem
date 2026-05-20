import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/admin/site-header';
import { ProjectsTable } from './projects-table';

export const metadata = { title: 'Studio Projects' };
export const dynamic  = 'force-dynamic';

export default async function ProjectsListPage() {
  const projects = await prisma.studioProject.findMany({
    where:   { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  const rows = projects.map((p) => ({
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    category:    p.category,
    location:    p.location,
    year:        p.year,
    status:      p.status,
    featured:    p.featured,
    publishedAt: p.publishedAt,
  }));

  return (
    <>
      <SiteHeader
        title="Studio Projects"
        action={
          <Button size="sm" asChild>
            <Link href="/admin/projects/new"><Plus className="size-4" /> New project</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'project' : 'projects'} in the catalogue.
        </p>
        <ProjectsTable rows={rows} />
      </div>
    </>
  );
}
