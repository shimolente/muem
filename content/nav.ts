/**
 * Navigation content — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface NavItem {
  label: string;
  href:  string;
  sub?:  string;   /* small descriptor shown beneath label on hover */
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Studio',      href: '/studio',     sub: 'Projects'    },
  { label: 'Lifestyle',   href: '/habitus',    sub: 'Furnitures'  },
  { label: 'Properties',  href: '/residences', sub: 'Real Estate' },
  { label: "Let's Talk",  href: '/contact'                        },
];

export const LOGO = {
  src:  '/muem-logo.svg',
  alt:  'Muem Studio',
  href: '/',
};
