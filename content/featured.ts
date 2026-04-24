export interface FeaturedProject {
  id:       string;
  title:    string;    // "Villa Murcielago"
  location: string;    // "NUSA DUA, BALI"
  imageSrc: string;
  href:     string;
  category: 'studio' | 'habitus' | 'residences';
}

export interface FeaturedCategory {
  id:       'studio' | 'habitus' | 'residences';
  label:    string;             // "Create"
  name:     string;             // "Houses & Villas" — shown in text cell
  tagline:  string;             // one-liner shown below name
  projects: FeaturedProject[];  // 6 or 8 — maps to bento cells A–F or A–H
}

export const FEATURED: FeaturedCategory[] = [
  {
    id: 'studio',
    label: 'Featured projects',
    name: 'Residential',
    tagline: 'Architecture at the intersection of craft and vision.',
    projects: [
      { id: 's1', title: 'Villa Murcielago', location: 'Nusa Dua, Bali',     imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's2', title: 'Casa Altozano',    location: 'Medellín, Colombia', imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's3', title: 'The Oak House',    location: 'Ubud, Bali',         imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's4', title: 'Maison Verte',     location: 'Canggu, Bali',       imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's5', title: 'Pavilion 12',      location: 'Seminyak, Bali',     imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's6', title: 'Terrace Studio',   location: 'Pererenan, Bali',    imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's7', title: 'Cliff Pavilion',   location: 'Uluwatu, Bali',      imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's8', title: 'Garden Retreat',   location: 'Ubud, Bali',         imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
      { id: 's9', title: 'Shore House',      location: 'Sanur, Bali',         imageSrc: '/images/studio-cover.jpg',     href: '/studio', category: 'studio' },
    ],
  },
  {
    id: 'habitus',
    label: 'Featured projects',
    name: 'Hospitality',
    tagline: 'Living spaces crafted for the way you actually live.',
    projects: [
      { id: 'h1', title: 'Villa Murcielago', location: 'Nusa Dua, Bali',     imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h2', title: 'Casa de Piedra',   location: 'Medellín, Colombia', imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h3', title: 'The Dune House',   location: 'Canggu, Bali',       imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h4', title: 'Bamboo Dwelling',  location: 'Ubud, Bali',         imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h5', title: 'Forest Retreat',   location: 'Seminyak, Bali',     imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h6', title: 'Cliff Villa',      location: 'Uluwatu, Bali',      imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h7', title: 'Terrace Loft',     location: 'Canggu, Bali',       imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h8', title: 'Garden Apartment', location: 'Pererenan, Bali',    imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
      { id: 'h9', title: 'Stone Loft',       location: 'Seminyak, Bali',     imageSrc: '/images/habitus-cover.jpg',    href: '/habitus', category: 'habitus' },
    ],
  },
  {
    id: 'residences',
    label: 'Featured projects',
    name: 'Commercial',
    tagline: 'Private residences conceived from the inside out.',
    projects: [
      { id: 'r1', title: 'Villa Murcielago', location: 'Nusa Dua, Bali',     imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r2', title: 'The Ridge House',  location: 'Seminyak, Bali',     imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r3', title: 'Terrace House',    location: 'Canggu, Bali',       imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r4', title: 'Casa Lumière',     location: 'Uluwatu, Bali',      imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r5', title: 'Pavilion House',   location: 'Pererenan, Bali',    imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r6', title: 'The Grove',        location: 'Ubud, Bali',         imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
      { id: 'r7', title: 'Cliffside Loft',   location: 'Uluwatu, Bali',      imageSrc: '/images/residences-cover.jpg', href: '/residences', category: 'residences' },
    ],
  },
];
