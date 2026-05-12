import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PropertyForm } from '../property-form';
import { DeletePropertyButton } from './delete-button';

export const metadata = { title: 'Edit Property' };
export const dynamic  = 'force-dynamic';

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All properties
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{property.title}</h1>
          <p className="text-sm text-muted-foreground">Last updated {property.updatedAt.toLocaleString()}</p>
        </div>
        <DeletePropertyButton id={property.id} title={property.title} />
      </div>

      <PropertyForm
        propertyId={property.id}
        initial={{
          slug:        property.slug,
          title:       property.title,
          subtitle:    property.subtitle,
          description: property.description,
          location:    property.location,
          topology:    property.topology,
          size:        property.size,
          year:        property.year,
          status:      property.status,
          priceFrom:   property.priceFrom,
          bedrooms:    property.bedrooms,
          bathrooms:   property.bathrooms,
          carPort:     property.carPort,
          unitsTotal:  property.unitsTotal,
          unitsSold:   property.unitsSold,
          featured:    property.featured,
          published:   property.publishedAt !== null,
          images:      property.images,
        }}
      />
    </div>
  );
}
