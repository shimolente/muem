'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteProperty } from '@/server/actions/properties';

export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`Delete "${title}"? It can be restored from the database.`)) return;
    startTransition(async () => {
      const res = await deleteProperty(id);
      if (!res.ok) { toast.error(res.error || 'Delete failed'); return; }
      toast.success('Property deleted');
      router.push('/admin/properties');
      router.refresh();
    });
  };

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={handleClick}>
      <Trash2 className="size-4" />
      {isPending ? 'Deleting…' : 'Delete'}
    </Button>
  );
}
