import { getCategories } from '@/lib/queries/categories';
import { SiteHeader } from '@/components/admin/site-header';
import { CategoryManager } from './categories-manager';
import type { CategoryKind } from '@prisma/client';

export const metadata = { title: 'Categories' };
export const dynamic  = 'force-dynamic';

const KINDS: { kind: CategoryKind; label: string }[] = [
  { kind: 'STUDIO',    label: 'Studio Projects' },
  { kind: 'PROPERTY',  label: 'Properties'      },
  { kind: 'FURNITURE', label: 'Furniture'       },
];

export default async function CategoriesPage() {
  const [studio, property, furniture] = await Promise.all([
    getCategories('STUDIO'),
    getCategories('PROPERTY'),
    getCategories('FURNITURE'),
  ]);
  const data: Record<CategoryKind, Awaited<ReturnType<typeof getCategories>>> = {
    STUDIO:    studio,
    PROPERTY:  property,
    FURNITURE: furniture,
  };

  return (
    <>
      <SiteHeader title="Categories" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <p className="text-sm text-muted-foreground">
          Manage the categories available to each content type. Adding one here makes it
          selectable on the matching form and shows it as a public filter. Renaming updates
          every item using it. A category in use can’t be deleted until its items are reassigned.
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {KINDS.map((k) => (
            <CategoryManager key={k.kind} kind={k.kind} label={k.label} initial={data[k.kind]} />
          ))}
        </div>
      </div>
    </>
  );
}
