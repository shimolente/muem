'use client';

import { Eye, EyeOff, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  count:        number;
  onClear:      () => void;
  onPublish:    () => void;
  onUnpublish:  () => void;
  onDelete:     () => void;
  disabled?:    boolean;
}

export function BulkToolbar({
  count, onClear, onPublish, onUnpublish, onDelete, disabled,
}: Props) {
  if (count === 0) return null;
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{count} selected</span>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={disabled}>
          <X className="size-3.5" /> Clear
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPublish} disabled={disabled}>
          <Eye className="size-3.5" /> Publish
        </Button>
        <Button variant="outline" size="sm" onClick={onUnpublish} disabled={disabled}>
          <EyeOff className="size-3.5" /> Unpublish
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={disabled}>
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
