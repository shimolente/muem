import { getSiteSettings } from '@/lib/queries/settings';
import { SiteHeader } from '@/components/admin/site-header';
import { SettingsForm } from './settings-form';

export const metadata = { title: 'Settings' };
export const dynamic  = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteHeader title="Settings" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <p className="text-sm text-muted-foreground">
          Edit site-wide content: socials, the coconuts counter, homepage snapshot
          numbers, and contact details.
        </p>
        <div className="max-w-3xl">
          <SettingsForm initial={settings} />
        </div>
      </div>
    </>
  );
}
