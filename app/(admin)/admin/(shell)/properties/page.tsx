import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/admin/site-header';
import { PropertiesTable } from './properties-table';

export const metadata = { title: 'Properties' };
export const dynamic  = 'force-dynamic';

export default async function PropertiesListPage() {
  const properties = await prisma.property.findMany({
    where:   { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  const rows = properties.map((p) => ({
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    topology:    p.topology,
    location:    p.location,
    priceFrom:   p.priceFrom,
    unitsTotal:  p.unitsTotal,
    unitsSold:   p.unitsSold,
    status:      p.status,
    featured:    p.featured,
    publishedAt: p.publishedAt,
  }));

  return (
    <>
      <SiteHeader
        title="Properties"
        action={
          <Button size="sm" asChild>
            <Link href="/admin/properties/new"><Plus className="size-4" /> New property</Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'property' : 'properties'} in the catalogue.
        </p>
        <PropertiesTable rows={rows} />
      </div>
    </>
  );
}
