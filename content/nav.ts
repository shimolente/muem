/**
 * Navigation content — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Studio',     href: '/studio' },
  { label: 'Habitus',    href: '/habitus' },
  { label: 'Residences', href: '/residences' },
  { label: 'Contact Us', href: '/contact' },
];

export const LOGO = {
  src:  '/muem-logo.svg',
  alt:  'Muem Studio',
  href: '/',
};
