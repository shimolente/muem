import { getSiteSettings } from '@/lib/queries/settings';
import { ContactSectionView } from './ContactSectionView';

/**
 * Server wrapper — fetches editable site settings (socials + coconuts count)
 * and feeds them to the client view. Kept at this path so all ~8 call sites
 * keep importing `ContactSection` unchanged. getSiteSettings is request-cached,
 * so rendering it on several pages costs one query.
 */
export async function ContactSection({ isPage = false }: { isPage?: boolean }) {
  const settings = await getSiteSettings();
  return (
    <ContactSectionView
      isPage={isPage}
      socials={settings.socials}
      coconuts={settings.coconutsShared}
    />
  );
}
