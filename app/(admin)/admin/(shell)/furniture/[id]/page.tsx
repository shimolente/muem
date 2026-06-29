import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { FurnitureForm } from '../furniture-form';
import { DeleteFurnitureButton } from './delete-button';
import { getCategories } from '@/lib/queries/categories';

export const metadata = { title: 'Edit Furniture' };
export const dynamic  = 'force-dynamic';

export default async function EditFurniturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    prisma.furniture.findFirst({ where: { id, deletedAt: null } }),
    getCategories('FURNITURE'),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/furniture" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All furniture
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{item.name}</h1>
          <p className="text-sm text-muted-foreground">Last updated {item.updatedAt.toLocaleString()}</p>
        </div>
        <DeleteFurnitureButton id={item.id} name={item.name} />
      </div>

      <FurnitureForm
        furnitureId={item.id}
        categories={categories}
        initial={{
          slug:        item.slug,
          name:        item.name,
          collection:  item.collection,
          category:    item.category,
          material:    item.material,
          price:       item.price,
          subtitle:    item.subtitle,
          description: item.description,
          dimensions:  item.dimensions,
          finish:      item.finish,
          leadTime:    item.leadTime,
          origin:      item.origin,
          featured:    item.featured,
          published:   item.publishedAt !== null,
          images:      item.images,
        }}
      />
    </div>
  );
}
