/**
 * Residences — investment properties curated by Muem.
 * Replace with Supabase fetch when CMS is live.
 */

export interface ResidenceProject {
  id:           string;
  title:        string;
  location:     string;
  topology:     string;   /* Villas | Houses | Apartments */
  size:         string;   /* per-unit size e.g. '180 m²' */
  year:         number;
  status?:      string;   /* e.g. 'Completed' | 'Pre-sale' | 'Completion 2026' */
  subtitle?:    string;
  description?: string;
  imageSrc:     string;
  images:       string[];
  featured?:    boolean;
  href:         string;
  /* ── Availability ─────────────────────────────────────────────────────── */
  unitsTotal:   number;   /* total units in the development */
  unitsSold:    number;   /* units already sold */
  priceFrom?:   string;   /* e.g. '$350,000' */
  /* ── Unit configuration ───────────────────────────────────────────────── */
  bedrooms?:    number;
  bathrooms?:   number;
  carPort?:     number;
}

export function unitsAvailable(p: ResidenceProject): number {
  return p.unitsTotal - p.unitsSold;
}
export function isSoldOut(p: ResidenceProject): boolean {
  return unitsAvailable(p) === 0;
}

export const RESIDENCES_PROJECTS: ResidenceProject[] = [
  {
    id: 'aria-villas', title: 'Aria Villas',
    location: 'Seminyak, Bali',   topology: 'Villas',
    size: '280 m²',  year: 2025,  status: 'Completion 2026',
    subtitle:    'Private tropical living in the heart of Seminyak',
    description: 'Aria Villas is a collection of eight fully-furnished tropical villas set within a lush garden compound in Seminyak. Each villa features a private pool, outdoor pavilion, and interiors crafted from locally-sourced natural materials — designed for personal use and high-yield short-term rental.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
    ],
    featured: true,
    href: '/residences/aria-villas',
    unitsTotal: 8, unitsSold: 6, priceFrom: '$420,000',
    bedrooms: 3, bathrooms: 3, carPort: 1,
  },
  {
    id: 'soka-retreat', title: 'Soka Retreat',
    location: 'Tabanan, Bali',    topology: 'Villas',
    size: '220 m²',  year: 2024,  status: 'Completed',
    subtitle:    'A hillside sanctuary overlooking the rice terraces',
    description: 'Soka Retreat comprises twelve villas on a hillside site in Tabanan, each positioned to maximise views across the terraced landscape. The development has been fully delivered and is now operating as a premium eco-retreat, with a track record of 90%+ annual occupancy.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
    ],
    href: '/residences/soka-retreat',
    unitsTotal: 12, unitsSold: 12, priceFrom: '$380,000',
    bedrooms: 2, bathrooms: 2, carPort: 1,
  },
  {
    id: 'blue-nusa', title: 'Blue Nusa Residences',
    location: 'Nusa Lembongan, Bali', topology: 'Villas',
    size: '160 m²',  year: 2026,  status: 'Pre-sale',
    subtitle:    'Oceanfront living on a car-free island',
    description: 'Blue Nusa is a boutique development of six private villas on the north coast of Nusa Lembongan. The site enjoys direct sea access, panoramic views towards the Bali mainland, and the unhurried pace of island life. An early-stage opportunity in one of Bali\'s fastest-growing destinations.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/residences/blue-nusa',
    unitsTotal: 6, unitsSold: 2, priceFrom: '$295,000',
    bedrooms: 2, bathrooms: 2, carPort: 0,
  },
  {
    id: 'kila-beach', title: 'Kila Beach Estates',
    location: 'Lombok, Indonesia', topology: 'Villas',
    size: '310 m²',  year: 2025,  status: 'Completion 2025',
    subtitle:    'Beachfront villas on Lombok\'s south coast',
    description: 'Kila Beach Estates occupies a rare stretch of south Lombok coastline — white sand, calm waters, and unobstructed views of the Indian Ocean. Ten villas in two configurations, ranging from two to four bedrooms, each with a private garden and direct beach access.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/residences/kila-beach',
    unitsTotal: 10, unitsSold: 8, priceFrom: '$510,000',
    bedrooms: 4, bathrooms: 4, carPort: 2,
  },
  {
    id: 'desa-hijau', title: 'Desa Hijau',
    location: 'Ubud, Bali',       topology: 'Houses',
    size: '190 m²',  year: 2026,  status: 'Pre-sale',
    subtitle:    'A green village in the cultural heart of Bali',
    description: 'Desa Hijau — "green village" — is a community of four homes on Ubud\'s forest edge. A collaboration between Muem and a local land custodian, the project prioritises ecological design: passive ventilation, reclaimed materials, and a shared permaculture garden.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/studio-cover.jpg',
      '/images/residences-cover.jpg', '/images/habitus-cover.jpg',
      '/images/studio-cover.jpg', '/images/residences-cover.jpg',
    ],
    featured: true,
    href: '/residences/desa-hijau',
    unitsTotal: 4, unitsSold: 0, priceFrom: '$260,000',
    bedrooms: 3, bathrooms: 2, carPort: 1,
  },
  {
    id: 'the-lomb', title: 'The Lomb',
    location: 'Kuta, Lombok',     topology: 'Apartments',
    size: '75 m²',   year: 2024,  status: 'Completed',
    subtitle:    'Surf, sleep, invest — Lombok\'s first design-led apartment',
    description: 'The Lomb brought design-led apartment living to Kuta Lombok — sixteen units across four floors, with a rooftop pool, coworking space, and surf storage. The project was fully sold prior to completion and is now delivering consistent rental returns for investors.',
    imageSrc: '/images/residences-cover.jpg',
    images: [
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
    ],
    href: '/residences/the-lomb',
    unitsTotal: 16, unitsSold: 16, priceFrom: '$155,000',
    bedrooms: 1, bathrooms: 1, carPort: 0,
  },
  {
    id: 'pererenan-heights', title: 'Pererenan Heights',
    location: 'Canggu, Bali',     topology: 'Villas',
    size: '240 m²',  year: 2025,  status: 'Completion 2025',
    subtitle:    'Five villas above the surf break',
    description: 'Pererenan Heights offers five independent villas on a ridge site above the Pererenan surf break. Floor-to-ceiling glass, cantilevered decks, and a palette of raw stone and weathered timber define each home. Two units remain available for purchase.',
    imageSrc: '/images/studio-cover.jpg',
    images: [
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
    ],
    href: '/residences/pererenan-heights',
    unitsTotal: 5, unitsSold: 3, priceFrom: '$390,000',
    bedrooms: 3, bathrooms: 3, carPort: 1,
  },
  {
    id: 'villa-ombak', title: 'Villa Ombak',
    location: 'Gili Trawangan',   topology: 'Villas',
    size: '200 m²',  year: 2026,  status: 'Pre-sale',
    subtitle:    'A rare trio of villas on the Gili Islands',
    description: 'Villa Ombak is an intimate development of three private villas on Gili Trawangan — the largest and most visited of the three islands. Car-free, quiet, and endlessly photogenic, the Gilis represent one of the most resilient luxury destinations in the archipelago.',
    imageSrc: '/images/habitus-cover.jpg',
    images: [
      '/images/habitus-cover.jpg', '/images/residences-cover.jpg',
      '/images/studio-cover.jpg', '/images/habitus-cover.jpg',
      '/images/residences-cover.jpg', '/images/studio-cover.jpg',
    ],
    href: '/residences/villa-ombak',
    unitsTotal: 3, unitsSold: 1, priceFrom: '$340,000',
    bedrooms: 3, bathrooms: 3, carPort: 0,
  },
];

/* ── Portfolio grid intro ─────────────────────────────────────────────────── */
export const RESIDENCES_INTRO = {
  label:    'Invest',
  headline: 'Properties\ncurated by Muem.',
  body:     "Each property is developed with the same design integrity as our architectural work — selected for location, craftsmanship, and long-term investment value.",
  cta:      { label: 'Browse all properties', href: '/residences' },
};

/* ── Availability filter options ──────────────────────────────────────────── */
export type AvailabilityFilter = 'all' | 'available' | 'soldout';

/* ── Topology filter categories (mirrored from studio for consistency) ────── */
export interface ResSubCategory { label: string; topologies: string[]; }
export interface ResCategoryDef { id: string; label: string; topologies: string[]; subs: ResSubCategory[]; }

export const RESIDENCE_CATEGORIES: ResCategoryDef[] = [
  {
    id: 'villas', label: 'Villas',
    topologies: ['Villas'],
    subs: [{ label: 'Private villas', topologies: ['Villas'] }],
  },
  {
    id: 'houses', label: 'Houses',
    topologies: ['Houses'],
    subs: [{ label: 'Family homes', topologies: ['Houses'] }],
  },
  {
    id: 'apartments', label: 'Apartments',
    topologies: ['Apartments'],
    subs: [{ label: 'Apartments & lofts', topologies: ['Apartments'] }],
  },
];
