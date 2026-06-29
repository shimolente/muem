'use client';

import { useEffect, useState, useTransition } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addFeatured, removeFeatured, reorderFeatured } from '@/server/actions/featured';
import type { FeaturedCategory } from '@prisma/client';

interface Slot {
  id:       string;
  title:    string;
  location: string | null;
}

interface Available {
  id:       string;
  title:    string;
  location: string | null;
}

interface Props {
  category:  FeaturedCategory;
  label:     string;
  tagline:   string;
  slots:     Slot[];
  available: Available[];
  max:       number;
}

export function FeaturedColumn({ category, label, tagline, slots: initialSlots, available, max }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [picking, setPicking] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const isFull = slots.length >= max;
  const slotsLeft = Math.max(0, max - slots.length);

  // Sync local state with server data after add/remove revalidate
  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = slots.findIndex((s) => s.id === active.id);
    const newIdx = slots.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    const next = arrayMove(slots, oldIdx, newIdx);
    setSlots(next);  // optimistic
    startTransition(async () => {
      const res = await reorderFeatured(category, next.map((s) => s.id));
      if (!res.ok) {
        toast.error(res.error);
        setSlots(slots);  // rollback
      }
    });
  };

  const onAdd = (projectId: string) => {
    setPicking('');
    startTransition(async () => {
      const res = await addFeatured(category, projectId);
      if (!res.ok) toast.error(res.error);
      else toast.success('Added');
    });
  };

  const onRemove = (slotId: string) => {
    const previous = slots;
    setSlots(slots.filter((s) => s.id !== slotId));
    startTransition(async () => {
      const res = await removeFeatured(slotId);
      if (!res.ok) {
        toast.error(res.error);
        setSlots(previous);
      } else {
        toast.success('Removed');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{label}</CardTitle>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            isFull ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'
          }`}>
            {slots.length} / {max}
          </span>
        </div>
        <CardDescription>
          {tagline}
          {' '}
          <span className="text-muted-foreground">
            {isFull ? '· All slots filled' : `· ${slotsLeft} slot${slotsLeft === 1 ? '' : 's'} left`}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No projects yet.
          </p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {slots.map((slot) => (
                <SortableRow
                  key={slot.id}
                  slot={slot}
                  onRemove={onRemove}
                  disabled={isPending}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {available.length > 0 && !isFull && (
          <div className="pt-2">
            <Select value={picking} onValueChange={onAdd} disabled={isPending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Plus className="size-4" /> Add a project…
                  </span>
                } />
              </SelectTrigger>
              <SelectContent>
                {available.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}{p.location ? ` — ${p.location}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isFull && (
          <p className="text-center text-xs text-muted-foreground">
            Category full — remove one to add another.
          </p>
        )}

        {!isFull && available.length === 0 && slots.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">All projects added.</p>
        )}
      </CardContent>
    </Card>
  );
}

function SortableRow({
  slot, onRemove, disabled,
}: {
  slot:     Slot;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: slot.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.6 : 1,
    zIndex:    isDragging ? 20 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-card px-2 py-2"
    >
      <button
        type="button"
        className="flex h-7 w-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{slot.title}</p>
        {slot.location && (
          <p className="truncate text-xs text-muted-foreground">{slot.location}</p>
        )}
      </div>
      <Button variant="ghost" size="icon" className="size-7" disabled={disabled}
              onClick={() => onRemove(slot.id)} aria-label="Remove">
        <X className="size-4" />
      </Button>
    </li>
  );
}
