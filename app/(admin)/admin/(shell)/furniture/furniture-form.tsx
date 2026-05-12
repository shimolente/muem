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
  furnitureSchema, FURNITURE_CATEGORIES, type FurnitureInput,
} from '@/server/actions/furniture/schema';
import { createFurniture, updateFurniture } from '@/server/actions/furniture';
import { ImageUploader } from '@/components/admin/image-uploader';

interface Props {
  furnitureId?: string;
  initial?: Partial<FurnitureInput>;
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function FurnitureForm({ furnitureId, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  const form = useForm<FurnitureInput>({
    resolver: zodResolver(furnitureSchema),
    defaultValues: {
      slug:        initial?.slug        ?? '',
      name:        initial?.name        ?? '',
      collection:  initial?.collection  ?? '',
      category:    initial?.category    ?? 'Chairs',
      material:    initial?.material    ?? '',
      price:       initial?.price       ?? '',
      subtitle:    initial?.subtitle    ?? '',
      description: initial?.description ?? '',
      dimensions:  initial?.dimensions  ?? '',
      finish:      initial?.finish      ?? '',
      leadTime:    initial?.leadTime    ?? '',
      origin:      initial?.origin      ?? '',
      featured:    initial?.featured    ?? false,
      published:   initial?.published   ?? false,
      images:      initial?.images      ?? [],
    },
  });

  const nameValue = form.watch('name');
  useEffect(() => {
    if (!slugTouched && nameValue) {
      form.setValue('slug', slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, form]);

  const onSubmit = (values: FurnitureInput) => {
    startTransition(async () => {
      const res = furnitureId
        ? await updateFurniture(furnitureId, values)
        : await createFurniture(values);

      if (!res.ok) {
        toast.error(res.error || 'Save failed');
        if ('fieldErrors' in res && res.fieldErrors) {
          Object.entries(res.fieldErrors).forEach(([key, errs]) => {
            form.setError(key as keyof FurnitureInput, { message: errs?.[0] });
          });
        }
        return;
      }
      toast.success(furnitureId ? 'Furniture updated' : 'Furniture created');
      router.push('/admin/furniture');
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
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
            <FormDescription>URL: /furniture/{field.value || 'your-slug'}</FormDescription>
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {FURNITURE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="collection" render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Oakwood Series" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="material" render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Charter Wood" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="$4,200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="dimensions" render={({ field }) => (
            <FormItem>
              <FormLabel>Dimensions</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="W 82 × D 88 × H 74 cm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="finish" render={({ field }) => (
            <FormItem>
              <FormLabel>Finish</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Natural grain, satin wax" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="leadTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Lead time</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="6–8 weeks" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="origin" render={({ field }) => (
            <FormItem>
              <FormLabel>Origin</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Handcrafted in Java, Indonesia" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="images" render={({ field }) => (
          <FormItem>
            <FormLabel>Images</FormLabel>
            <FormControl>
              <ImageUploader value={field.value ?? []} onChange={field.onChange} />
            </FormControl>
            <FormDescription>First image is used as the cover.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField control={form.control} name="featured" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>Featured</FormLabel>
                <FormDescription>Spans 2 cols on the furniture grid.</FormDescription>
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
            {isPending ? 'Saving…' : furnitureId ? 'Save changes' : 'Create item'}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/furniture">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
