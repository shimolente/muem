'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { GripVertical, Star } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { BulkToolbar } from '@/components/admin/bulk-toolbar';
import {
  reorderProjects,
  bulkDeleteProjects,
  bulkSetProjectsPublished,
} from '@/server/actions/projects';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Completed:  'default',
  InProgress: 'secondary',
  Concept:    'outline',
};
const STATUS_LABEL: Record<string, string> = {
  Completed:  'Completed',
  InProgress: 'In Progress',
  Concept:    'Concept',
};

export interface ProjectRow {
  id:          string;
  slug:        string;
  title:       string;
  category:    string | null;
  location:    string | null;
  year:        number | null;
  status:      string;
  featured:    boolean;
  publishedAt: Date | null;
}

interface Props { rows: ProjectRow[] }

export function ProjectsTable({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => { setRows(initialRows); }, [initialRows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = rows.findIndex((r) => r.id === active.id);
    const newIdx = rows.findIndex((r) => r.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(rows, oldIdx, newIdx);
    setRows(next);
    startTransition(async () => {
      const res = await reorderProjects(next.map((r) => r.id));
      if (!res.ok) {
        toast.error(res.error);
        setRows(rows);
      }
    });
  };

  const toggle = (id: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const ids = () => Array.from(selected);

  const onPublish = () => startTransition(async () => {
    const res = await bulkSetProjectsPublished(ids(), true);
    if (!res.ok) toast.error(res.error);
    else { toast.success(`Published ${selected.size}`); setSelected(new Set()); }
  });

  const onUnpublish = () => startTransition(async () => {
    const res = await bulkSetProjectsPublished(ids(), false);
    if (!res.ok) toast.error(res.error);
    else { toast.success(`Unpublished ${selected.size}`); setSelected(new Set()); }
  });

  const onDelete = () => {
    if (!confirm(`Delete ${selected.size} project(s)? They will be soft-deleted.`)) return;
    startTransition(async () => {
      const res = await bulkDeleteProjects(ids());
      if (!res.ok) toast.error(res.error);
      else { toast.success(`Deleted ${selected.size}`); setSelected(new Set()); }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <BulkToolbar
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
        onDelete={onDelete}
        disabled={isPending}
      />

      <div className="rounded-md border bg-card">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    No projects yet. Create the first one →
                  </TableCell>
                </TableRow>
              )}
              <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                {rows.map((p) => (
                  <SortableRow
                    key={p.id}
                    row={p}
                    selected={selected.has(p.id)}
                    onToggle={() => toggle(p.id)}
                    disabled={isPending}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}

function SortableRow({
  row, selected, onToggle, disabled,
}: {
  row: ProjectRow;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: row.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.6 : 1,
    position:  isDragging ? 'relative' : undefined,
    zIndex:    isDragging ? 20 : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} data-state={selected ? 'selected' : undefined}>
      <TableCell>
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label="Select row" />
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {row.featured && <Star className="size-3.5 fill-foreground text-foreground" />}
          <span className="font-medium">{row.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">/{row.slug}</span>
      </TableCell>
      <TableCell>
        {row.category && (
          <Badge variant="outline">
            {row.category === 'FoodAndBeverage' ? 'F&B' : row.category}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-sm">{row.location ?? '—'}</TableCell>
      <TableCell className="text-sm tabular-nums">{row.year ?? '—'}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
      </TableCell>
      <TableCell>
        {row.publishedAt ? <Badge>Live</Badge> : <Badge variant="outline">Draft</Badge>}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/projects/${row.id}`}>Edit</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
