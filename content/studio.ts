/**
 * Studio portfolio projects — CMS-ready.
 * Replace with Supabase fetch when CMS is live.
 */

export interface StudioProject {
  id:       string;
  title:    string;
  location: string;
  topology: string;   /* Villas | Houses | Apartments | Residential | Commercial | Hospitality */
  size:     string;   /* e.g. '480 m²' */
  year:     number;
  imageSrc: string;
  href:     string;
}

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: 'villa-murcielago', title: 'Villa Murcielago',
    location: 'Nusa Dua, Bali',     topology: 'Villas',
    size: '480 m²',   year: 2025,
    imageSrc: '/images/studio-cover.jpg',     href: '/studio/villa-murcielago',
  },
  {
    id: 'the-layar', title: 'The Layar',
    location: 'Seminyak, Bali',     topology: 'Hospitality',
    size: '1200 m²',  year: 2024,
    imageSrc: '/images/habitus-cover.jpg',    href: '/studio/the-layar',
  },
  {
    id: 'casa-terra', title: 'Casa Terra',
    location: 'Uluwatu, Bali',      topology: 'Villas',
    size: '320 m²',   year: 2025,
    imageSrc: '/images/residences-cover.jpg', href: '/studio/casa-terra',
  },
  {
    id: 'alang-alang', title: 'Alang Alang House',
    location: 'Canggu, Bali',       topology: 'Houses',
    size: '560 m²',   year: 2023,
    imageSrc: '/images/studio-cover.jpg',     href: '/studio/alang-alang',
  },
  {
    id: 'the-junction', title: 'The Junction',
    location: 'Berawa, Bali',       topology: 'Commercial',
    size: '740 m²',   year: 2024,
    imageSrc: '/images/habitus-cover.jpg',    href: '/studio/the-junction',
  },
  {
    id: 'omah-kayu', title: 'Omah Kayu',
    location: 'Ubud, Bali',         topology: 'Hospitality',
    size: '280 m²',   year: 2023,
    imageSrc: '/images/residences-cover.jpg', href: '/studio/omah-kayu',
  },
  {
    id: 'villa-pica', title: 'Villa Pica',
    location: 'Lombok, Indonesia',  topology: 'Villas',
    size: '620 m²',   year: 2025,
    imageSrc: '/images/studio-cover.jpg',     href: '/studio/villa-pica',
  },
  {
    id: 'desa-soka', title: 'Desa Soka',
    location: 'Tabanan, Bali',      topology: 'Hospitality',
    size: '2400 m²',  year: 2024,
    imageSrc: '/images/habitus-cover.jpg',    href: '/studio/desa-soka',
  },
  {
    id: 'the-grove', title: 'The Grove Residence',
    location: 'Pererenan, Bali',    topology: 'Houses',
    size: '400 m²',   year: 2023,
    imageSrc: '/images/residences-cover.jpg', href: '/studio/the-grove',
  },
  {
    id: 'k-house', title: 'K House',
    location: 'Sanur, Bali',        topology: 'Houses',
    size: '290 m²',   year: 2022,
    imageSrc: '/images/studio-cover.jpg',     href: '/studio/k-house',
  },
  {
    id: 'studio-meja', title: 'Studio Meja',
    location: 'Denpasar, Bali',     topology: 'Commercial',
    size: '150 m²',   year: 2022,
    imageSrc: '/images/habitus-cover.jpg',    href: '/studio/studio-meja',
  },
  {
    id: 'pendopo-house', title: 'Pendopo House',
    location: 'Gianyar, Bali',      topology: 'Residential',
    size: '510 m²',   year: 2023,
    imageSrc: '/images/residences-cover.jpg', href: '/studio/pendopo-house',
  },
];

/* ── Portfolio grid intro ─────────────────────────────────────────────────── */
export const STUDIO_INTRO = {
  label:    'Create',
  headline: 'Beyond design.\nPrecision in every detail.',
  body:     "We don't limit our vision to what you see. We work across the full spectrum of spatial design — from early concept to built reality.",
  cta:      { label: 'Explore all services', href: '/studio' },
};

/* ── Year filter (flat list) ──────────────────────────────────────────────── */
export const YEARS = ['All Years', '2025', '2024', '2023', '2022'];

/* ── Size range matcher ───────────────────────────────────────────────────── */
/*
 * Size values used in the filter:
 *   'Small'  — up to 300 m²
 *   'Medium' — 300–1 500 m²
 *   'Large'  — 1 500–10 000 m²
 *   'Urban'  — 10 000+ m²
 */
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
/*
 * If a region label like 'Bali' is selected, match all projects
 * whose location ends with ', Bali'.
 * If a specific location like 'Berawa, Bali' is selected, exact match.
 */
export function matchLocation(projectLocation: string, filterValue: string): boolean {
  if (!filterValue || filterValue.startsWith('All')) return true;
  /* Exact location match */
  if (projectLocation === filterValue) return true;
  /* Region match — value has no comma, so it's a parent group label */
  if (!filterValue.includes(',') && projectLocation.endsWith(`, ${filterValue}`)) return true;
  return false;
}
