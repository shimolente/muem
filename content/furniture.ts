/**
 * Lifestyle (Habitus) — furniture collections content.
 * Replace placeholder images with real product photography.
 */

export interface FurnitureItem {
  id:         string;
  name:       string;
  collection: string;   /* e.g. "Oakwood Series" */
  category:   FurnitureCategory;
  material:   string;
  price:      string;   /* formatted, e.g. "$4,200" */
  images:     string[];
  href:       string;
  featured?:  boolean;
}

export type FurnitureCategory =
  | 'Chairs'
  | 'Tables'
  | 'Consoles'
  | 'Shelving'
  | 'Sofas'
  | 'Extras';

export const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  'Chairs', 'Tables', 'Consoles', 'Shelving', 'Sofas', 'Extras',
];

export const FURNITURE_INTRO = {
  label:    'Live',
  headline: 'Pieces to complete\nyour perfect spaces',
  body:     'Want to live in our design? We connect you with the craftspeople capable of bringing these collections into your home.',
  cta:      { label: "Explore how it works", href: '#' },
};

/* ── Items ─────────────────────────────────────────────────────────────────── */
export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id:         'rosita-lounge-chair',
    name:       'Rosita Lounge Chair',
    collection: 'Oakwood Series',
    category:   'Chairs',
    material:   'Charter Wood',
    price:      '$4,020',
    images:     ['/images/project-1.jpg', '/images/project-2.jpg'],
    href:       '/habitus/rosita-lounge-chair',
    featured:   true,
  },
  {
    id:         'volta-dining-chair',
    name:       'Volta Dining Chair',
    collection: 'Volta Series',
    category:   'Chairs',
    material:   'PVC Duo',
    price:      '$920',
    images:     ['/images/project-2.jpg'],
    href:       '/habitus/volta-dining-chair',
  },
  {
    id:         'merano-accent-chair',
    name:       'Merano Accent Chair',
    collection: 'Stone Edit',
    category:   'Chairs',
    material:   'Polished Concrete',
    price:      '$3,600',
    images:     ['/images/project-3.jpg'],
    href:       '/habitus/merano-accent-chair',
  },
  {
    id:         'saya-dining-table',
    name:       'Saya Dining Table',
    collection: 'Oakwood Series',
    category:   'Tables',
    material:   'Limestone',
    price:      '$6,800',
    images:     ['/images/project-4.jpg', '/images/project-1.jpg'],
    href:       '/habitus/saya-dining-table',
    featured:   true,
  },
  {
    id:         'nesta-side-table',
    name:       'Nesta Side Table',
    collection: 'Volta Series',
    category:   'Tables',
    material:   'Charter Wood',
    price:      '$1,200',
    images:     ['/images/project-5.jpg'],
    href:       '/habitus/nesta-side-table',
  },
  {
    id:         'arco-console',
    name:       'Arco Console',
    collection: 'Stone Edit',
    category:   'Consoles',
    material:   'Polished Concrete',
    price:      '$3,900',
    images:     ['/images/project-6.jpg'],
    href:       '/habitus/arco-console',
  },
  {
    id:         'koto-console',
    name:       'Koto Entry Console',
    collection: 'Oakwood Series',
    category:   'Consoles',
    material:   'Charter Wood',
    price:      '$2,600',
    images:     ['/images/project-7.jpg'],
    href:       '/habitus/koto-console',
  },
  {
    id:         'reva-shelving-unit',
    name:       'Reva Shelving Unit',
    collection: 'Volta Series',
    category:   'Shelving',
    material:   'PVC Duo',
    price:      '$2,100',
    images:     ['/images/project-8.jpg'],
    href:       '/habitus/reva-shelving-unit',
  },
  {
    id:         'luma-wall-shelf',
    name:       'Luma Wall Shelf',
    collection: 'Stone Edit',
    category:   'Shelving',
    material:   'Limestone',
    price:      '$880',
    images:     ['/images/project-9.jpg'],
    href:       '/habitus/luma-wall-shelf',
  },
  {
    id:         'brea-sofa',
    name:       'Brea Modular Sofa',
    collection: 'Oakwood Series',
    category:   'Sofas',
    material:   'Charter Wood',
    price:      '$9,400',
    images:     ['/images/project-10.jpg', '/images/project-3.jpg'],
    href:       '/habitus/brea-sofa',
    featured:   true,
  },
  {
    id:         'duna-loveseat',
    name:       'Duna Loveseat',
    collection: 'Volta Series',
    category:   'Sofas',
    material:   'PVC Duo',
    price:      '$5,200',
    images:     ['/images/project-11.jpg'],
    href:       '/habitus/duna-loveseat',
  },
  {
    id:         'arca-planter',
    name:       'Arca Planter Set',
    collection: 'Stone Edit',
    category:   'Extras',
    material:   'Polished Concrete',
    price:      '$640',
    images:     ['/images/project-12.jpg'],
    href:       '/habitus/arca-planter',
  },
];
