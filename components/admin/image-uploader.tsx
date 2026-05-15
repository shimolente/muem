'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { imageUrl } from '@/lib/imageUrl';

interface Props {
  value:    string[];
  onChange: (next: string[]) => void;
  /** Owning entity for Storage path scoping. Required. */
  entityType: 'projects' | 'properties' | 'furniture';
  /** Record id (real cuid for edits, draft cuid for new). Required. */
  entityId:   string;
  /** Max images allowed (default 20) */
  max?:     number;
}

export function ImageUploader({ value, onChange, entityType, entityId, max = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    if (value.length + list.length > max) {
      toast.error(`Max ${max} images. ${max - value.length} slot(s) remaining.`);
      return;
    }

    setBusy(true);
    const uploaded: string[] = [];
    let failed = 0;

    for (const file of list) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('entityType', entityType);
      fd.append('entityId', entityId);
      try {
        const res = await fetch('/api/upload/image', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          failed++;
          console.error('[upload]', json);
          continue;
        }
        // Store the BASE path (no size, no extension) — renderers compose
        // size variants via lib/imageUrl#imageUrl.
        uploaded.push(json.basePath);
      } catch (e) {
        failed++;
        console.error('[upload]', e);
      }
    }
    setBusy(false);

    if (uploaded.length) onChange([...value, ...uploaded]);
    if (failed)   toast.error(`${failed} upload${failed > 1 ? 's' : ''} failed`);
    if (uploaded.length) toast.success(`Uploaded ${uploaded.length} image${uploaded.length > 1 ? 's' : ''}`);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {/* ── Drop zone ─────────────────────────────────────── */}
      <div
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-10 text-center transition-colors',
          isDragging ? 'border-foreground bg-accent' : 'hover:bg-accent/40',
          busy && 'pointer-events-none opacity-60',
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
        }}
      >
        {busy ? (
          <>
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <ImagePlus className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Drop images here, or click to browse</p>
            <p className="text-xs text-muted-foreground">
              JPG/PNG/WebP/HEIC up to 12 MB · auto-resized to WebP
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {/* ── Thumbnails ───────────────────────────────────── */}
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((src, i) => (
            <li
              key={src + i}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(src, 'sm')} alt="" className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-foreground/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <Button type="button" size="icon" variant="secondary" className="size-7" disabled={i === 0}
                          onClick={() => move(i, -1)} aria-label="Move left">
                    <ArrowUp className="size-3.5 -rotate-90" />
                  </Button>
                  <Button type="button" size="icon" variant="secondary" className="size-7" disabled={i === value.length - 1}
                          onClick={() => move(i, 1)} aria-label="Move right">
                    <ArrowDown className="size-3.5 -rotate-90" />
                  </Button>
                </div>
                <Button type="button" size="icon" variant="destructive" className="size-7"
                        onClick={() => remove(i)} aria-label="Remove">
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
