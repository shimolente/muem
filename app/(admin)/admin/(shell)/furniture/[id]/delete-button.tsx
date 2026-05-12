'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteFurniture } from '@/server/actions/furniture';

export function DeleteFurnitureButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm(`Delete "${name}"? It can be restored from the database.`)) return;
    startTransition(async () => {
      const res = await deleteFurniture(id);
      if (!res.ok) { toast.error(res.error || 'Delete failed'); return; }
      toast.success('Furniture deleted');
      router.push('/admin/furniture');
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
