import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/admin/site-header';
import { FurnitureTable } from './furniture-table';

export const metadata = { title: 'Furniture' };
export const dynamic  = 'force-dynamic';

export default async function FurnitureListPage() {
  const items = await prisma.furniture.findMany({
    where:   { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  const rows = items.map((f) => ({
    id:          f.id,
    slug:        f.slug,
    name:        f.name,
    category:    f.category,
    collection:  f.collection,
    material:    f.material,
    price:       f.price,
    featured:    f.featured,
    publishedAt: f.publishedAt,
  }));

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
          {rows.length} {rows.length === 1 ? 'item' : 'items'} in the catalogue.
        </p>
        <FurnitureTable rows={rows} />
      </div>
    </>
  );
}
