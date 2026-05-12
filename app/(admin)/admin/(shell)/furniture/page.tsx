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
import { moveFurniture } from '@/server/actions/furniture';

export const metadata = { title: 'Furniture' };
export const dynamic  = 'force-dynamic';

export default async function FurnitureListPage() {
  const items = await prisma.furniture.findMany({
    where:   { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return (
    <>
      <SiteHeader
        title="Furniture"
        action={
          <Button size="sm" asChild>
            <Link href="/admin/furniture/new"><Plus className="size-4" /> New item</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <p className="text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? 'item' : 'items'} in the catalogue.
      </p>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No furniture yet. Create the first one →
                </TableCell>
              </TableRow>
            )}
            {items.map((f, i) => (
              <TableRow key={f.id}>
                <TableCell>
                  <RowReorder
                    id={f.id}
                    canMoveUp={i > 0}
                    canMoveDown={i < items.length - 1}
                    action={moveFurniture}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {f.featured && <Star className="size-3.5 fill-foreground text-foreground" />}
                    <span className="font-medium">{f.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">/{f.slug}</span>
                </TableCell>
                <TableCell><Badge variant="outline">{f.category}</Badge></TableCell>
                <TableCell className="text-sm">{f.collection ?? '—'}</TableCell>
                <TableCell className="text-sm">{f.material ?? '—'}</TableCell>
                <TableCell className="text-sm tabular-nums">{f.price ?? '—'}</TableCell>
                <TableCell>
                  {f.publishedAt ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/furniture/${f.id}`}>Edit</Link>
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
