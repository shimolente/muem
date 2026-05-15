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
  propertySchema, PROPERTY_STATUSES, PROPERTY_TOPOLOGIES, type PropertyInput,
} from '@/server/actions/properties/schema';
import { createProperty, updateProperty } from '@/server/actions/properties';
import { ImageUploader } from '@/components/admin/image-uploader';
import { makeDraftId } from '@/lib/imageUrl';

interface Props {
  propertyId?: string;
  initial?: Partial<PropertyInput>;
}

const STATUS_LABEL: Record<typeof PROPERTY_STATUSES[number], string> = {
  Completed:  'Completed',
  InProgress: 'In Progress',
  Concept:    'Concept',
};

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const NUM_OR_NULL = (v: string) => v === '' ? null : Number(v);

export function PropertyForm({ propertyId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [draftId] = useState(() => propertyId ?? makeDraftId());

  const form = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      slug:        initial?.slug        ?? '',
      title:       initial?.title       ?? '',
      subtitle:    initial?.subtitle    ?? '',
      description: initial?.description ?? '',
      location:    initial?.location    ?? '',
      topology:    initial?.topology    ?? null,
      size:        initial?.size        ?? '',
      year:        initial?.year        ?? null,
      status:      initial?.status      ?? 'Completed',
      priceFrom:   initial?.priceFrom   ?? '',
      bedrooms:    initial?.bedrooms    ?? null,
      bathrooms:   initial?.bathrooms   ?? null,
      carPort:     initial?.carPort     ?? null,
      unitsTotal:  initial?.unitsTotal  ?? null,
      unitsSold:   initial?.unitsSold   ?? 0,
      featured:    initial?.featured    ?? false,
      published:   initial?.published   ?? false,
      images:      initial?.images      ?? [],
    },
  });

  const titleValue = form.watch('title');
  useEffect(() => {
    if (!slugTouched && titleValue) {
      form.setValue('slug', slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, slugTouched, form]);

  const onSubmit = (values: PropertyInput) => {
    startTransition(async () => {
      const payload = propertyId ? values : { ...values, id: draftId };
      const res = propertyId
        ? await updateProperty(propertyId, payload)
        : await createProperty(payload);

      if (!res.ok) {
        toast.error(res.error || 'Save failed');
        if ('fieldErrors' in res && res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([key, errs]) => {
            form.setError(key as keyof PropertyInput, { message: errs?.[0] });
          });
        }
        return;
      }
      toast.success(propertyId ? 'Property updated' : 'Property created');
      router.push('/admin/properties');
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Identity */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input {...field} onChange={(e) => { setSlugTouched(true); field.onChange(e); }} />
            </FormControl>
            <FormDescription>URL: /residences/{field.value || 'your-slug'}</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="subtitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Subtitle</FormLabel>
            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea rows={5} {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Specs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="topology" render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select value={field.value ?? undefined} onValueChange={(v) => field.onChange(v || null)}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                <SelectContent>
                  {PROPERTY_TOPOLOGIES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="size" render={({ field }) => (
            <FormItem>
              <FormLabel>Unit size</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} placeholder="280 m²" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="priceFrom" render={({ field }) => (
            <FormItem>
              <FormLabel>Price from</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} placeholder="$420,000" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="year" render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(NUM_OR_NULL(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {PROPERTY_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Unit configuration */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <FormField control={form.control} name="bedrooms" render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''}
                       onChange={(e) => field.onChange(NUM_OR_NULL(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bathrooms" render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''}
                       onChange={(e) => field.onChange(NUM_OR_NULL(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="carPort" render={({ field }) => (
            <FormItem>
              <FormLabel>Car port</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''}
                       onChange={(e) => field.onChange(NUM_OR_NULL(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Availability */}
        <div className="grid grid-cols-2 gap-6">
          <FormField control={form.control} name="unitsTotal" render={({ field }) => (
            <FormItem>
              <FormLabel>Total units</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''}
                       onChange={(e) => field.onChange(NUM_OR_NULL(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="unitsSold" render={({ field }) => (
            <FormItem>
              <FormLabel>Units sold</FormLabel>
              <FormControl>
                <Input type="number" {...field}
                       onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Images */}
        <FormField control={form.control} name="images" render={({ field }) => (
          <FormItem>
            <FormLabel>Images</FormLabel>
            <FormControl>
              <ImageUploader
                value={field.value ?? []}
                onChange={field.onChange}
                entityType="properties"
                entityId={draftId}
              />
            </FormControl>
            <FormDescription>First image is used as the cover.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        {/* Toggles */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField control={form.control} name="featured" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>Featured</FormLabel>
                <FormDescription>Highlights on /residences listing.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="published" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>Published</FormLabel>
                <FormDescription>Visible on the public site.</FormDescription>
              </div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : propertyId ? 'Save changes' : 'Create property'}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/properties">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
