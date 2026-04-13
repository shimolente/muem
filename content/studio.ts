/**
 * Studio portfolio projects — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface StudioProject {
  id:           string;
  title:        string;
  location:     string;
  topology:     string;   /* Villas | Houses | Apartments | Residential | Commercial | Hospitality */
  size:         string;   /* e.g. '480 m²' */
  year:         number;
  status?:      string;   /* e.g. 'Completed' | 'In Progress' | 'Concept' */
  subtitle?:    string;   /* poetic subheadline shown in project detail intro */
  description?: string;   /* body paragraph shown in project detail intro */
  imageSrc:     string;   /* primary/cover image — kept for backwards compat */
  images:       string[]; /* all images for per-card carousel + detail gallery */
  featured?:    boolean;  /* spans 2 columns in the grid */
  href:         string;
}

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: 'villa-murcielago', title: 'Villa Murcielago',
    location: 'Nusa Dua, Bali',     topology: 'Villas',
    size: '480 m²',   year: 2025,   status: 'Completed',
    subtitle:     'Where privacy meets the horizon',
    description:  'Set on a private ridge overlooking the Indian Ocean, Villa Murcielago was conceived as a dialogue between land and sea. The architecture responds to the site — cantilevered volumes, deep overhangs, and open pavilions that dissolve the boundary between interior and landscape.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
    ],
    featured: true,
    href: '/studio/villa-murcielago',
  },
  {
    id: 'the-layar', title: 'The Layar',
    location: 'Seminyak, Bali',     topology: 'Hospitality',
    size: '1200 m²',  year: 2024,   status: 'Completed',
    subtitle:     'A layered experience of space and light',
    description:  'The Layar brings together boutique hospitality and refined architecture in the heart of Seminyak. Every public space and private villa is designed to frame its natural surroundings — tropical gardens, reflecting pools, and the texture of hand-crafted materials throughout.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/studio/the-layar',
  },
  {
    id: 'casa-terra', title: 'Casa Terra',
    location: 'Uluwatu, Bali',      topology: 'Villas',
    size: '320 m²',   year: 2025,   status: 'In Progress',
    subtitle:     'Earth, stone, and sky in balance',
    description:  'Perched on the cliffs of Uluwatu, Casa Terra is an exercise in restraint. Raw limestone walls, rammed earth floors, and minimal interventions allow the drama of the site to speak. A home that belongs entirely to its landscape.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/studio/casa-terra',
  },
  {
    id: 'alang-alang', title: 'Alang Alang House',
    location: 'Canggu, Bali',       topology: 'Houses',
    size: '560 m²',   year: 2023,   status: 'Completed',
    subtitle:     'A dialogue between the sea and the jungle',
    description:  'Located in the heart of Pererenan, Canggu is one of the city\'s most iconic and protected buildings. Its twin façade, measuring over thirty metres, overlooks the Bandas and opens onto the sea, making it a landmark of the local architectural heritage.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
    ],
    href: '/studio/alang-alang',
  },
  {
    id: 'the-junction', title: 'The Junction',
    location: 'Berawa, Bali',       topology: 'Commercial',
    size: '740 m²',   year: 2024,   status: 'Completed',
    subtitle:     'Commerce and community, unified',
    description:  'The Junction redefines mixed-use development in Berawa — a coherent ensemble of retail, workspace, and communal courtyard that creates genuine urban life rather than mimicking it. The architecture foregrounds materiality: exposed concrete, weathered steel, and planted walls.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/studio/the-junction',
  },
  {
    id: 'omah-kayu', title: 'Omah Kayu',
    location: 'Ubud, Bali',         topology: 'Hospitality',
    size: '280 m²',   year: 2023,   status: 'Completed',
    subtitle:     'Craftsmanship rooted in forest and tradition',
    description:  'Omah Kayu draws from Javanese timber craft and Balinese spatial tradition to create a retreat that feels genuinely rooted in place. Reclaimed teak, hand-woven rattan, and a site plan that follows the contours of the rice terraces give the project an unhurried, earned quality.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/studio/omah-kayu',
  },
  {
    id: 'villa-pica', title: 'Villa Pica',
    location: 'Lombok, Indonesia',  topology: 'Villas',
    size: '620 m²',   year: 2025,   status: 'In Progress',
    subtitle:     'Stillness on the edge of the Gili Sea',
    description:  'Villa Pica occupies a rare site on Lombok\'s northern coastline, with unobstructed views across to the Gili Islands. The design centres on a long, low pavilion that opens fully to the prevailing breeze — architecture that serves the climate rather than resisting it.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
    ],
    href: '/studio/villa-pica',
  },
  {
    id: 'desa-soka', title: 'Desa Soka',
    location: 'Tabanan, Bali',      topology: 'Hospitality',
    size: '2400 m²',  year: 2024,   status: 'Completed',
    subtitle:     'A village of experience, woven into the landscape',
    description:  'Desa Soka is conceived as a village — a series of pavilions, paths, and communal spaces that evolve across a gently sloping site in Tabanan. The hospitality programme is embedded in the landscape rather than placed upon it, with rice fields, gardens, and open-air dining forming the heart of the experience.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
    ],
    featured: true,
    href: '/studio/desa-soka',
  },
  {
    id: 'the-grove', title: 'The Grove Residence',
    location: 'Pererenan, Bali',    topology: 'Houses',
    size: '400 m²',   year: 2023,   status: 'Completed',
    subtitle:     'Living beneath a canopy of breadfruit and frangipani',
    description:  'The Grove was designed around three mature trees that the owners refused to remove. The result is a home that wraps itself around nature rather than the other way around — with a canopy of breadfruit and frangipani shading the terraces, and a plan that breathes with the seasons.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/studio/the-grove',
  },
  {
    id: 'k-house', title: 'K House',
    location: 'Sanur, Bali',        topology: 'Houses',
    size: '290 m²',   year: 2022,   status: 'Completed',
    subtitle:     'Quiet geometry on a corner lot',
    description:  'K House occupies a modest corner plot in the residential lanes of Sanur. The design resolves the challenge of privacy and openness in a dense urban grain: closed to the street, generously open to the garden, with a central courtyard that acts as the lungs of the house.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/studio/k-house',
  },
  {
    id: 'studio-meja', title: 'Studio Meja',
    location: 'Denpasar, Bali',     topology: 'Commercial',
    size: '150 m²',   year: 2022,   status: 'Completed',
    subtitle:     'A workspace that earns its place',
    description:  'Studio Meja is a creative workspace in central Denpasar designed around the act of making. The brief was simple: a place where people want to spend time working. The result is a compact, highly resolved interior that layers natural materials, borrowed light, and precisely considered proportions.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/studio/studio-meja',
  },
  {
    id: 'pendopo-house', title: 'Pendopo House',
    location: 'Gianyar, Bali',      topology: 'Residential',
    size: '510 m²',   year: 2023,   status: 'Completed',
    subtitle:     'The pendopo as a contemporary act',
    description:  'Pendopo House reinterprets the traditional Javanese open pavilion for contemporary family living. The central pendopo — a column-supported, open-sided hall — becomes the social heart of the house, connecting kitchen, living, and garden in a single, generous gesture.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/studio/pendopo-house',
  },
];

/* ── Portfolio grid intro ─────────────────────────────────────────────────── */
export const STUDIO_INTRO = {
  label:    'Create',
  headline: 'Beyond design.\nPrecision in every detail.',
  body:     "We don't limit our vision to what you see. We work across the full spectrum of spatial design — from early concept to built reality.",
  cta:      { label: 'Explore all services', href: '/studio' },
};

/* ── Year filter ──────────────────────────────────────────────────────────── */
export const YEARS = ['All Years', '2025', '2024', '2023', '2022'];

/* ── Category taxonomy — maps UI categories to topology values ────────────── */
export interface SubCategory {
  label:      string;
  topologies: string[];
}
export interface CategoryDef {
  id:         string;
  label:      string;
  topologies: string[];   /* all topologies in this category */
  subs:       SubCategory[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'residential', label: 'Residential',
    topologies: ['Villas', 'Houses', 'Apartments', 'Residential'],
    subs: [
      { label: 'Houses & Villas',    topologies: ['Houses', 'Villas']          },
      { label: 'Apartments & lofts', topologies: ['Apartments', 'Residential'] },
    ],
  },
  {
    id: 'hospitality', label: 'Hospitality',
    topologies: ['Hospitality'],
    subs: [
      { label: 'Hotels & resorts', topologies: ['Hospitality'] },
      { label: 'Villas for rent',  topologies: ['Hospitality'] },
    ],
  },
  {
    id: 'commercial', label: 'Commercial & other',
    topologies: ['Commercial'],
    subs: [
      { label: 'Equipments',         topologies: ['Commercial'] },
      { label: 'Offices',            topologies: ['Commercial'] },
      { label: 'Restaurant / shops', topologies: ['Commercial'] },
      { label: 'Other',              topologies: ['Commercial'] },
    ],
  },
];

/* ── Size range matcher ───────────────────────────────────────────────────── */
export function matchSizeRange(projectSize: string, sizeValue: string): boolean {
  const num = parseFloat(projectSize.replace(/\s/g, '').replace('m²', ''));
  if (isNaN(num)) return true;
  switch (sizeValue) {
    case 'Small':  return num < 300;
    case 'Medium': return num >= 300 && num < 1500;
    case 'Large':  return num >= 1500 && num < 10000;
    case 'Urban':  return num >= 10000;
    default:       return true;
  }
}

/* ── Location group matcher ───────────────────────────────────────────────── */
export function matchLocation(projectLocation: string, filterValue: string): boolean {
  if (!filterValue || filterValue.startsWith('All')) return true;
  if (projectLocation === filterValue) return true;
  if (!filterValue.includes(',') && projectLocation.endsWith(`, ${filterValue}`)) return true;
  return false;
}
