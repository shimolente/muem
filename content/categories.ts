export interface Category {
  id:           string;
  label:        string;   // "Create"
  name:         string;   // "Studio"
  href:         string;
  imageSrc:     string;
  imageAlt:     string;
  body:         string;
  cta:          string;
  ctaHref:      string;
  expandOrigin: 'left' | 'center' | 'right';
}

export const CATEGORIES: Category[] = [
  {
    id: 'studio', label: 'Create', name: 'Studio', href: '/studio',
    imageSrc: '/images/studio-cover.jpg', imageAlt: 'Studio project',
    body: 'We guide selective individuals and brands in shaping clarity from complexity, crafting elevated lifestyles, and achieving results that transcend expectations.',
    cta: 'Design with us', ctaHref: '/studio', expandOrigin: 'left',
  },
  {
    id: 'habitus', label: 'Live', name: 'Habitus', href: '/habitus',
    imageSrc: '/images/habitus-cover.jpg', imageAlt: 'Habitus project',
    body: 'Living spaces that breathe. Interiors crafted for the way you actually live — layered, personal, and enduring.',
    cta: 'Explore spaces', ctaHref: '/habitus', expandOrigin: 'center',
  },
  {
    id: 'residences', label: 'Explore', name: 'Residences', href: '/residences',
    imageSrc: '/images/residences-cover.jpg', imageAlt: 'Residences project',
    body: 'Private residences conceived from the inside out. Architecture that responds to site, light, and the lives lived within.',
    cta: 'See residences', ctaHref: '/residences', expandOrigin: 'right',
  },
];
