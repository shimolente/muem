import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { CONTACT, type SocialLink } from '@/content/contact';
import { ABOUT, type Stat } from '@/content/about';

export interface SiteSettingsData {
  socials:         SocialLink[];
  coconutsShared:  number;
  aboutStats:      Stat[];
  contactEmail:    string;
  contactWhatsapp: string;
  contactLocation: string;
}

/** Defaults mirror the values previously hardcoded in content/*.ts + components. */
const FALLBACK: SiteSettingsData = {
  socials:         CONTACT.socials,
  coconutsShared:  84,
  aboutStats:      ABOUT.stats,
  contactEmail:    CONTACT.email,
  contactWhatsapp: CONTACT.whatsapp,
  contactLocation: CONTACT.location,
};

/**
 * Read the single SiteSettings row. Cached per-request (React cache) so the
 * many components that need it (ContactSection wrapper, AboutSection) share one
 * query. Falls back to the hardcoded content defaults on error / missing row —
 * same resilience pattern as lib/queries/furniture.ts.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    if (!row) return FALLBACK;

    const socials    = row.socials    as unknown as SocialLink[] | null;
    const aboutStats = row.aboutStats as unknown as Stat[] | null;

    return {
      socials:         socials?.length    ? socials    : FALLBACK.socials,
      coconutsShared:  row.coconutsShared,
      aboutStats:      aboutStats?.length ? aboutStats : FALLBACK.aboutStats,
      contactEmail:    row.contactEmail    ?? FALLBACK.contactEmail,
      contactWhatsapp: row.contactWhatsapp ?? FALLBACK.contactWhatsapp,
      contactLocation: row.contactLocation ?? FALLBACK.contactLocation,
    };
  } catch {
    return FALLBACK;
  }
});
