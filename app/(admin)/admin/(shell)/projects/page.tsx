import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { RowReorder } from '@/components/admin/row-reorder';
import { SiteHeader } from '@/components/admin/site-header';
import { moveProject } from '@/server/actions/projects';

export const metadata = { title: 'Studio Projects' };
export const dynamic  = 'force-dynamic';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Completed:  'default',
  InProgress: 'secondary',
  Concept:    'outline',
};

const STATUS_LABEL: Record<string, string> = {
  Completed:  'Completed',
  InProgress: 'In Progress',
  Concept:    'Concept',
};

export default async function ProjectsListPage() {
  const projects = await prisma.studioProject.findMany({
    where:   { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

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
        {projects.length} {projects.length === 1 ? 'project' : 'projects'} in the catalogue.
      </p>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No projects yet. Create the first one →
                </TableCell>
              </TableRow>
            )}
            {projects.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <RowReorder
                    id={p.id}
                    canMoveUp={i > 0}
                    canMoveDown={i < projects.length - 1}
                    action={moveProject}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {p.featured && <Star className="size-3.5 fill-foreground text-foreground" />}
                    <span className="font-medium">{p.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">/{p.slug}</span>
                </TableCell>
                <TableCell>
                  {p.category && (
                    <Badge variant="outline">
                      {p.category === 'FoodAndBeverage' ? 'F&B' : p.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">{p.location ?? '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">{p.year ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[p.status]}>
                    {STATUS_LABEL[p.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.publishedAt ? (
                    <Badge variant="default">Live</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/projects/${p.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </>
  );
}
