'use client';

import { useTransition } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type MoveResult = { ok: true } | { ok: false; error: string } | { ok: true; data: undefined };
type MoveAction = (id: string, direction: 'up' | 'down') => Promise<MoveResult>;

interface Props {
  id:           string;
  canMoveUp:    boolean;
  canMoveDown:  boolean;
  action:       MoveAction;
}

export function RowReorder({ id, canMoveUp, canMoveDown, action }: Props) {
  const [isPending, startTransition] = useTransition();

  const move = (direction: 'up' | 'down') => {
    startTransition(async () => {
      const res = await action(id, direction);
      if (!res.ok && 'error' in res) toast.error(res.error);
    });
  };

  return (
    <div className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon" className="size-7"
              disabled={isPending || !canMoveUp}
              onClick={() => move('up')} aria-label="Move up">
        <ArrowUp className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="size-7"
              disabled={isPending || !canMoveDown}
              onClick={() => move('down')} aria-label="Move down">
        <ArrowDown className="size-3.5" />
      </Button>
    </div>
  );
}
