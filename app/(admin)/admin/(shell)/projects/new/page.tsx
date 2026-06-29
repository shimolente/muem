import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm } from '../project-form';
import { getCategories } from '@/lib/queries/categories';

export const metadata = { title: 'New Studio Project' };
export const dynamic  = 'force-dynamic';

export default async function NewProjectPage() {
  const categories = await getCategories('STUDIO');
  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">New Studio Project</h1>
      </div>
      <ProjectForm categories={categories} />
    </div>
  );
}
