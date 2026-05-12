import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PropertyForm } from '../property-form';

export const metadata = { title: 'New Property' };

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> All properties
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New Property</h1>
      </div>
      <PropertyForm />
    </div>
  );
}
