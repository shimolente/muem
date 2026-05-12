import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FurnitureForm } from '../furniture-form';

export const metadata = { title: 'New Furniture' };

export default function NewFurniturePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/furniture" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> All furniture
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New Furniture</h1>
      </div>
      <FurnitureForm />
    </div>
  );
}
