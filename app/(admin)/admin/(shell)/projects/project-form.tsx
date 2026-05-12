'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button }   from '@/components/ui/button';
import { Switch }   from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  projectSchema, PROJECT_STATUSES, PROJECT_CATEGORIES, type ProjectInput,
} from '@/server/actions/projects/schema';
import { createProject, updateProject } from '@/server/actions/projects';
import { ImageUploader } from '@/components/admin/image-uploader';

interface Props {
  projectId?: string;             // present = edit mode
  initial?: Partial<ProjectInput>;
}

const STATUS_LABEL: Record<typeof PROJECT_STATUSES[number], string> = {
  Completed:  'Completed',
  InProgress: 'In Progress',
  Concept:    'Concept',
};

const CATEGORY_LABEL: Record<typeof PROJECT_CATEGORIES[number], string> = {
  Residential:     'Residential',
  Hospitality:     'Hospitality',
  Commercial:      'Commercial',
  FoodAndBeverage: 'F&B',
  Retail:          'Retail',
};

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ProjectForm({ projectId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug:        initial?.slug        ?? '',
      title:       initial?.title       ?? '',
      subtitle:    initial?.subtitle    ?? '',
      description: initial?.description ?? '',
      location:    initial?.location    ?? '',
      topology:    initial?.topology    ?? '',
      category:    initial?.category    ?? null,
      size:        initial?.size        ?? '',
      year:        initial?.year        ?? null,
      status:      initial?.status      ?? 'Completed',
      featured:    initial?.featured    ?? false,
      published:   initial?.published   ?? false,
      images:      initial?.images      ?? [],
    },
  });

  // Auto-generate slug from title until user manually edits slug
  const titleValue = form.watch('title');
  useEffect(() => {
    if (!slugTouched && titleValue) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, slugTouched, form]);

  const onSubmit = (values: ProjectInput) => {
    startTransition(async () => {
      const res = projectId
        ? await updateProject(projectId, values)
        : await createProject(values);

      if (!res.ok) {
        toast.error(res.error || 'Save failed');
        if ('fieldErrors' in res && res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([key, errs]) => {
            form.setError(key as keyof ProjectInput, { message: errs?.[0] });
          });
        }
        return;
      }
      toast.success(projectId ? 'Project updated' : 'Project created');
      router.push('/admin/projects');
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Identity ─────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => { setSlugTouched(true); field.onChange(e); }}
                />
              </FormControl>
              <FormDescription>URL: /studio/{field.value || 'your-slug'}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Specs ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topology"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topology</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Villa, Hospitality…" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="480 m²" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Images ──────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUploader value={field.value ?? []} onChange={field.onChange} />
              </FormControl>
              <FormDescription>First image is used as the cover.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Toggles ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Featured</FormLabel>
                  <FormDescription>Spans 2 cols on the studio page grid.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Published</FormLabel>
                  <FormDescription>Visible on the public site.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : projectId ? 'Save changes' : 'Create project'}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/projects">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
