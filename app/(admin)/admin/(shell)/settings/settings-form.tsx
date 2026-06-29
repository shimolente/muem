'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { updateSettings } from '@/server/actions/settings';
import type { SiteSettingsData } from '@/lib/queries/settings';

type SocialField = { label: string; href: string };
type StatField   = { value: string; label: string; tagsText: string };

interface FormValues {
  socials:         SocialField[];
  coconutsShared:  number;
  aboutStats:      StatField[];
  contactEmail:    string;
  contactWhatsapp: string;
  contactLocation: string;
}

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      socials:         initial.socials,
      coconutsShared:  initial.coconutsShared,
      aboutStats:      initial.aboutStats.map((s) => ({
        value: s.value,
        label: s.label,
        tagsText: s.tags.join(', '),
      })),
      contactEmail:    initial.contactEmail,
      contactWhatsapp: initial.contactWhatsapp,
      contactLocation: initial.contactLocation,
    },
  });

  const { register, control, handleSubmit } = form;
  const socials = useFieldArray({ control, name: 'socials' });
  const stats   = useFieldArray({ control, name: 'aboutStats' });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await updateSettings({
        socials:         values.socials,
        coconutsShared:  Number(values.coconutsShared) || 0,
        aboutStats:      values.aboutStats.map((s) => ({
          value: s.value,
          label: s.label,
          tags:  s.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
        })),
        contactEmail:    values.contactEmail,
        contactWhatsapp: values.contactWhatsapp,
        contactLocation: values.contactLocation,
      });

      if (!res.ok) {
        toast.error(res.error || 'Save failed');
        return;
      }
      toast.success('Settings saved');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Social links ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
          <CardDescription>Shown in the contact / footer section across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {socials.fields.map((f, i) => (
            <div key={f.id} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Label</Label>
                <Input placeholder="Instagram" {...register(`socials.${i}.label` as const)} />
              </div>
              <div className="flex-[2] space-y-1">
                <Label className="text-xs">Link</Label>
                <Input placeholder="https://instagram.com/…" {...register(`socials.${i}.href` as const)} />
              </div>
              <Button type="button" variant="ghost" size="icon" className="mb-0.5"
                      onClick={() => socials.remove(i)} aria-label="Remove">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
                  onClick={() => socials.append({ label: '', href: '' })}>
            <Plus className="size-4" /> Add social
          </Button>
        </CardContent>
      </Card>

      {/* ── Coconuts shared ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Coconuts shared</CardTitle>
          <CardDescription>The animated counter in the contact section.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-40 space-y-1">
            <Label className="text-xs">Count</Label>
            <Input type="number" min={0}
                   {...register('coconutsShared', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* ── About stat counters (snapshots) ────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Snapshot numbers</CardTitle>
          <CardDescription>
            The animated stats on the homepage About section (e.g. “30+ Projects”).
            Tags are comma-separated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.fields.map((f, i) => (
            <div key={f.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-end gap-2">
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input placeholder="30+" {...register(`aboutStats.${i}.value` as const)} />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input placeholder="Projects" {...register(`aboutStats.${i}.label` as const)} />
                </div>
                <Button type="button" variant="ghost" size="icon" className="mb-0.5"
                        onClick={() => stats.remove(i)} aria-label="Remove">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input placeholder="Residential, Hospitality, Commercial"
                       {...register(`aboutStats.${i}.tagsText` as const)} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm"
                  onClick={() => stats.append({ value: '', label: '', tagsText: '' })}>
            <Plus className="size-4" /> Add stat
          </Button>
        </CardContent>
      </Card>

      {/* ── Contact details ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Stored for use across the site and email templates.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" {...register('contactEmail')} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">WhatsApp</Label>
            <Input {...register('contactWhatsapp')} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location</Label>
            <Input {...register('contactLocation')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
