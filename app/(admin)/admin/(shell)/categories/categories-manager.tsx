'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Check, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  createCategory, updateCategory, deleteCategory, reorderCategories,
} from '@/server/actions/categories';
import type { CategoryOption } from '@/lib/queries/categories';
import type { CategoryKind } from '@prisma/client';

interface Props {
  kind:    CategoryKind;
  label:   string;
  initial: CategoryOption[];
}

export function CategoryManager({ kind, label, initial }: Props) {
  const router = useRouter();
  const [items, setItems]   = useState<CategoryOption[]>(initial);
  const [adding, setAdding] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setItems(initial); }, [initial]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok?: string) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) { toast.error(res.error || 'Failed'); return; }
      if (ok) toast.success(ok);
      router.refresh();
    });

  const onAdd = () => {
    const v = adding.trim();
    if (!v) return;
    setAdding('');
    run(() => createCategory(kind, v), 'Category added');
  };

  const onMove = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next); // optimistic
    run(() => reorderCategories(kind, next.map((c) => c.id)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{items.length} categor{items.length === 1 ? 'y' : 'ies'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((c, i) => (
          <CategoryRow
            key={c.id}
            category={c}
            disabled={isPending}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            onMoveUp={() => onMove(i, -1)}
            onMoveDown={() => onMove(i, 1)}
            onRename={(label) => run(() => updateCategory(c.id, label), 'Renamed')}
            onDelete={() => run(() => deleteCategory(c.id), 'Deleted')}
          />
        ))}

        {items.length === 0 && (
          <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
            No categories yet.
          </p>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Input
            value={adding}
            disabled={isPending}
            placeholder="New category…"
            onChange={(e) => setAdding(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          />
          <Button type="button" variant="outline" size="icon" disabled={isPending || !adding.trim()}
                  onClick={onAdd} aria-label="Add category">
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryRow({
  category, disabled, isFirst, isLast, onMoveUp, onMoveDown, onRename, onDelete,
}: {
  category:   CategoryOption;
  disabled:   boolean;
  isFirst:    boolean;
  isLast:     boolean;
  onMoveUp:   () => void;
  onMoveDown: () => void;
  onRename:   (label: string) => void;
  onDelete:   () => void;
}) {
  const [value, setValue] = useState(category.label);
  useEffect(() => { setValue(category.label); }, [category.label]);
  const dirty = value.trim() !== category.label && value.trim().length > 0;

  return (
    <div className="flex items-center gap-1 rounded-md border bg-card px-2 py-1.5">
      <div className="flex flex-col">
        <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={disabled || isFirst} onClick={onMoveUp} aria-label="Move up">
          <ChevronUp className="size-3.5" />
        </button>
        <button type="button" className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                disabled={disabled || isLast} onClick={onMoveDown} aria-label="Move down">
          <ChevronDown className="size-3.5" />
        </button>
      </div>
      <Input
        value={value}
        disabled={disabled}
        className="h-8 flex-1"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && dirty) { e.preventDefault(); onRename(value.trim()); } }}
      />
      {dirty && (
        <Button type="button" variant="ghost" size="icon" className="size-8" disabled={disabled}
                onClick={() => onRename(value.trim())} aria-label="Save name">
          <Check className="size-4" />
        </Button>
      )}
      <Button type="button" variant="ghost" size="icon" className="size-8" disabled={disabled}
              onClick={onDelete} aria-label="Delete">
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
