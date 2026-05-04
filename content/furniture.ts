/**
 * Lifestyle (Habitus) — furniture collections content.
 * Replace placeholder images with real product photography.
 */

export interface FurnitureItem {
  id:           string;
  name:         string;
  collection:   string;
  category:     FurnitureCategory;
  material:     string;
  price:        string;
  images:       string[];
  href:         string;
  featured?:    boolean;
  subtitle?:    string;
  description?: string;
  dimensions?:  string;
  finish?:      string;
  leadTime?:    string;
  origin?:      string;
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

export const FURNITURE_COLLECTIONS: Record<string, { tagline: string; description: string }> = {
  'Oakwood Series': {
    tagline:     'Warmth in every grain',
    description: 'Our Charter Wood pieces are crafted from sustainably harvested oak, each one finished by hand to reveal the timber\'s natural character. The Oakwood Series balances structural rigour with the quiet warmth only wood can offer — pieces that age alongside the spaces they inhabit.',
  },
  'Volta Series': {
    tagline:     'Form follows feeling',
    description: 'Volta explores the intersection of industrial material and refined silhouette. PVC Duo — a layered composite developed in partnership with our artisans — holds its edge without sacrificing tactility. Every piece in this series is designed to age with the room, growing more characterful with use.',
  },
  'Stone Edit': {
    tagline:     'Weight, permanence, presence',
    description: 'Polished concrete and Limestone pieces from the Stone Edit carry the visual gravity of the earth they came from. Minimally processed and rigorously detailed, each object invites you to slow down and pay attention. No two pieces are identical.',
  },
};

export const FURNITURE_INTRO = {
  label:    'Live',
  headline: 'Pieces to complete\nyour perfect spaces',
  body:     'Want to live in our design? We connect you with the craftspeople capable of bringing these collections into your home.',
  cta:      { label: 'Explore how it works', href: '#' },
};

/* ── Items ─────────────────────────────────────────────────────────────────── */
export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id:          'rosita-lounge-chair',
    name:        'Rosita Lounge Chair',
    collection:  'Oakwood Series',
    category:    'Chairs',
    material:    'Charter Wood',
    price:       '$4,020',
    images:      ['/images/chair.jpg', '/images/sofa.jpg'],
    href:        '/furniture/rosita-lounge-chair',
    featured:    true,
    subtitle:    'Where craft meets repose',
    description: 'Three prototyping rounds to find the exact recline that holds you — not holds you back. Charter Wood arms give the Rosita its warmth; the seat proportions do the rest. A piece that looks considered when empty and feels inevitable when occupied.',
    dimensions:  'W 82 × D 88 × H 74 cm · Seat H 40 cm',
    finish:      'Natural grain, satin wax',
    leadTime:    '6–8 weeks',
    origin:      'Handcrafted in Java, Indonesia',
  },
  {
    id:          'volta-dining-chair',
    name:        'Volta Dining Chair',
    collection:  'Volta Series',
    category:    'Chairs',
    material:    'PVC Duo',
    price:       '$920',
    images:      ['/images/chair.jpg'],
    href:        '/furniture/volta-dining-chair',
    subtitle:    'Versatile enough for anywhere',
    description: 'A dining chair that reads as sculpture when unoccupied. The Volta\'s PVC Duo shell is moulded in a single continuous form — no joins, no compromise. Pairs naturally with the Saya Dining Table, but holds its own against anything.',
    dimensions:  'W 46 × D 52 × H 80 cm · Seat H 46 cm',
    finish:      'Matte lacquer',
    leadTime:    '4–6 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
  },
  {
    id:          'merano-accent-chair',
    name:        'Merano Accent Chair',
    collection:  'Stone Edit',
    category:    'Chairs',
    material:    'Polished Concrete',
    price:       '$3,600',
    images:      ['/images/chair.jpg'],
    href:        '/furniture/merano-accent-chair',
    subtitle:    'Stillness, made solid',
    description: 'The Merano is a study in reduction. Cast in polished concrete with a single organic curve for the backrest, it asks very little and gives a great deal — presence, texture, and permanence in equal measure.',
    dimensions:  'W 58 × D 62 × H 78 cm · Seat H 44 cm',
    finish:      'Honed concrete, penetrating sealer',
    leadTime:    '8–10 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
  },
  {
    id:          'saya-dining-table',
    name:        'Saya Dining Table',
    collection:  'Oakwood Series',
    category:    'Tables',
    material:    'Limestone',
    price:       '$6,800',
    images:      ['/images/table.jpg', '/images/chair.jpg'],
    href:        '/furniture/saya-dining-table',
    featured:    true,
    subtitle:    'The table everything else gathers around',
    description: 'Saya seats eight comfortably, ten when the conversation is good. The Limestone top is sourced from a single quarry slab and finished by hand — no two tables share the same veining. Oak legs are mortise-and-tenon jointed, no metal fasteners.',
    dimensions:  'W 220 × D 100 × H 75 cm',
    finish:      'Honed limestone, oil-treated oak',
    leadTime:    '8–12 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
  },
  {
    id:          'nesta-side-table',
    name:        'Nesta Side Table',
    collection:  'Volta Series',
    category:    'Tables',
    material:    'Charter Wood',
    price:       '$1,200',
    images:      ['/images/table.jpg'],
    href:        '/furniture/nesta-side-table',
    subtitle:    'Small form, strong character',
    description: 'Nesta is the table that sits beside your reading chair and never draws attention to itself — except when guests ask where it\'s from. Charter Wood in a slim rectangular profile, with a lower shelf for books or objects.',
    dimensions:  'W 45 × D 45 × H 55 cm',
    finish:      'Matte oil, natural grain',
    leadTime:    '3–5 weeks',
    origin:      'Handcrafted in Java, Indonesia',
  },
  {
    id:          'arco-console',
    name:        'Arco Console',
    collection:  'Stone Edit',
    category:    'Consoles',
    material:    'Polished Concrete',
    price:       '$3,900',
    images:      ['/images/table.jpg'],
    href:        '/furniture/arco-console',
    subtitle:    'An entrance worth arriving to',
    description: 'Cast in a single pour, the Arco Console brings the Stone Edit\'s material honesty to your entry or living wall. The arched apron — from which it takes its name — softens the mass without reducing the presence.',
    dimensions:  'W 140 × D 38 × H 82 cm',
    finish:      'Polished concrete, clear penetrating sealer',
    leadTime:    '8–10 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
  },
  {
    id:          'koto-console',
    name:        'Koto Entry Console',
    collection:  'Oakwood Series',
    category:    'Consoles',
    material:    'Charter Wood',
    price:       '$2,600',
    images:      ['/images/table.jpg', '/images/shelf.jpg'],
    href:        '/furniture/koto-console',
    subtitle:    'The first thing you see',
    description: 'The Koto is designed for the entry — a narrow footprint, generous surface, and a single lower rail for bags or baskets. Charter Wood construction with a hand-rubbed finish that develops richer tones with age.',
    dimensions:  'W 120 × D 36 × H 80 cm',
    finish:      'Natural grain, hand-rubbed oil',
    leadTime:    '5–7 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
  },
  {
    id:          'reva-shelving-unit',
    name:        'Reva Shelving Unit',
    collection:  'Volta Series',
    category:    'Shelving',
    material:    'PVC Duo',
    price:       '$2,100',
    images:      ['/images/shelf.jpg'],
    href:        '/furniture/reva-shelving-unit',
    subtitle:    'Display without clutter',
    description: 'Five open shelves in a format that keeps your collection visible and your walls clean. Reva\'s PVC Duo construction is lighter than it looks — wall-mounted with concealed fixings, the unit appears to float.',
    dimensions:  'W 90 × D 28 × H 180 cm',
    finish:      'Matte lacquer, concealed wall anchors',
    leadTime:    '5–7 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
  },
  {
    id:          'luma-wall-shelf',
    name:        'Luma Wall Shelf',
    collection:  'Stone Edit',
    category:    'Shelving',
    material:    'Limestone',
    price:       '$880',
    images:      ['/images/shelf.jpg'],
    href:        '/furniture/luma-wall-shelf',
    subtitle:    'One shelf, done right',
    description: 'A single slab of Limestone, cantilevered from a concealed steel bracket. The Luma is deceptively simple — the weight of the material makes it feel permanent, the minimalist form makes it feel inevitable.',
    dimensions:  'W 80 × D 22 × H 4 cm',
    finish:      'Honed limestone, matte sealer',
    leadTime:    '4–6 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
  },
  {
    id:          'brea-sofa',
    name:        'Brea Modular Sofa',
    collection:  'Oakwood Series',
    category:    'Sofas',
    material:    'Charter Wood',
    price:       '$9,400',
    images:      ['/images/sofa.jpg', '/images/chair.jpg'],
    href:        '/furniture/brea-sofa',
    featured:    true,
    subtitle:    'The room starts here',
    description: 'Brea is configured in three modules that combine to seat four or six — or separate into individual pieces as the room evolves. Charter Wood base, deep cushions upholstered in natural linen. The sofa that makes a living room feel like one.',
    dimensions:  'W 280 × D 95 × H 72 cm (3-seat) · Seat H 38 cm',
    finish:      'Charter Wood base, natural linen upholstery',
    leadTime:    '10–14 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
  },
  {
    id:          'duna-loveseat',
    name:        'Duna Loveseat',
    collection:  'Volta Series',
    category:    'Sofas',
    material:    'PVC Duo',
    price:       '$5,200',
    images:      ['/images/sofa.jpg'],
    href:        '/furniture/duna-loveseat',
    subtitle:    'Intimacy at the right scale',
    description: 'Two-seater dimensions for bedrooms, reading corners, and spaces where a full sofa would dominate. Duna\'s PVC Duo frame keeps the silhouette light while the deep seat cushion invites longer stays than planned.',
    dimensions:  'W 158 × D 88 × H 68 cm · Seat H 40 cm',
    finish:      'PVC Duo frame, bouclé upholstery',
    leadTime:    '7–9 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
  },
  {
    id:          'arca-planter',
    name:        'Arca Planter Set',
    collection:  'Stone Edit',
    category:    'Extras',
    material:    'Polished Concrete',
    price:       '$640',
    images:      ['/images/shelf.jpg'],
    href:        '/furniture/arca-planter',
    subtitle:    'For living things that deserve a good home',
    description: 'Three vessels in graduating heights — cast in polished concrete with an internal drainage system and removable liner. The Arca set works as a tableau or distributed across a room, indoors or sheltered outdoors.',
    dimensions:  'Small: ⌀ 18 × H 22 cm · Medium: ⌀ 24 × H 30 cm · Large: ⌀ 32 × H 40 cm',
    finish:      'Polished concrete, wax sealer, drainage insert',
    leadTime:    '3–4 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
  },
];
