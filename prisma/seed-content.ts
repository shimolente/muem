/**
 * Seed the CMS with placeholder Studio Projects, Properties, and Furniture.
 * Images point at /public/images/{properties,furniture}/000NNN.jpg — sourced
 * from the local `property_images/` and `furniture_images/` folders.
 *
 * Idempotent — safe to re-run, upserts by slug.
 *
 * Usage: npm run db:seed-content
 */

import { PrismaClient } from '@prisma/client';
import type {
  ProjectCategory, ProjectStatus, PropertyTopology, FurnitureCategory,
} from '@prisma/client';

const prisma = new PrismaClient();

/* ── Image helpers ───────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(6, '0');
const prop = (n: number) => `/images/properties/${pad(n)}.jpg`;
const furn = (n: number) => `/images/furniture/${pad(n)}.jpg`;

/* ── Studio Projects (12) ────────────────────────────────────────────────── */

interface StudioSeed {
  slug:        string;
  title:       string;
  subtitle:    string;
  description: string;
  location:    string;
  topology:    string;          // free-text for public site
  category:    ProjectCategory;
  size:        string;
  year:        number;
  status:      ProjectStatus;
  imageNums:   number[];        // first = cover
  featured?:   boolean;
}

const STUDIO: StudioSeed[] = [
  {
    slug:        'villa-murcielago',
    title:       'Villa Murcielago',
    subtitle:    'A cliff dialogue between ocean and stone',
    description: 'Anchored to a private ridge above the Indian Ocean, Villa Murcielago opens to the horizon through cantilevered volumes and stone-clad terraces. Deep overhangs and open pavilions dissolve the line between interior and the salt air outside.',
    location:    'Nusa Dua, Bali',
    topology:    'Villas',
    category:    'Residential',
    size:        '480 m²',
    year:        2025,
    status:      'Completed',
    imageNums:   [1, 21, 22, 23],
    featured:    true,
  },
  {
    slug:        'the-layar',
    title:       'The Layar',
    subtitle:    'Boutique hospitality, layered in light',
    description: 'Twelve villas, three gardens, one quiet conversation between modern hospitality and the rhythms of Seminyak. Reflecting pools cool the public spaces; hand-laid stone gives every surface a fingerprint.',
    location:    'Seminyak, Bali',
    topology:    'Hospitality',
    category:    'Hospitality',
    size:        '1200 m²',
    year:        2024,
    status:      'Completed',
    imageNums:   [2, 24, 25, 26],
  },
  {
    slug:        'casa-terra',
    title:       'Casa Terra',
    subtitle:    'Earth, lifted into view',
    description: 'A rammed-earth home perched on the Uluwatu cliffs. We let the limestone of the site finish the architecture — bedrock walls, mineral floors, and a single long line of glass holding the sea.',
    location:    'Uluwatu, Bali',
    topology:    'Villas',
    category:    'Residential',
    size:        '320 m²',
    year:        2025,
    status:      'InProgress',
    imageNums:   [3, 27, 28, 29],
  },
  {
    slug:        'alang-alang',
    title:       'Alang Alang House',
    subtitle:    'A house written in grass and timber',
    description: 'Named for the wild grass that surrounds the site, Alang Alang sits low in the Canggu plain. Bamboo shading, ironwood floors, and a thatched roof structure that breathes with the trade winds.',
    location:    'Canggu, Bali',
    topology:    'Houses',
    category:    'Residential',
    size:        '560 m²',
    year:        2023,
    status:      'Completed',
    imageNums:   [4, 30, 31, 32],
  },
  {
    slug:        'the-junction',
    title:       'The Junction',
    subtitle:    'Where commerce learns to be quiet',
    description: 'A mixed-use block in Berawa that pulls retail, workspace, and a planted courtyard into a single coherent gesture. Weathered steel, exposed concrete, and a slow-growing fig at the centre.',
    location:    'Berawa, Bali',
    topology:    'Commercial',
    category:    'Commercial',
    size:        '740 m²',
    year:        2024,
    status:      'Completed',
    imageNums:   [5, 33, 34, 35],
  },
  {
    slug:        'omah-kayu',
    title:       'Omah Kayu',
    subtitle:    'A retreat measured in heartwood',
    description: 'Reclaimed teak, hand-woven rattan, and the unhurried geometry of the Javanese pendopo. Omah Kayu sits inside the Ubud rice terraces like it has always been there — the seventh village along the path.',
    location:    'Ubud, Bali',
    topology:    'Hospitality',
    category:    'Hospitality',
    size:        '280 m²',
    year:        2023,
    status:      'Completed',
    imageNums:   [6, 36, 37, 38],
  },
  {
    slug:        'villa-pica',
    title:       'Villa Pica',
    subtitle:    'A pavilion that holds its breath',
    description: 'A single low-slung pavilion on Lombok\'s northern coast, opened entirely to the prevailing breeze. Pica is climate-led architecture: stack ventilation, deep eaves, and a plan that follows the sun.',
    location:    'Lombok, Indonesia',
    topology:    'Villas',
    category:    'Residential',
    size:        '620 m²',
    year:        2025,
    status:      'InProgress',
    imageNums:   [7, 39, 40, 41],
  },
  {
    slug:        'desa-soka',
    title:       'Desa Soka',
    subtitle:    'A village, not a resort',
    description: 'Eighteen pavilions threaded across a sloping Tabanan site. Communal kitchens, hidden gardens, and a path system that turns every walk into a discovery. Hospitality dissolved into landscape.',
    location:    'Tabanan, Bali',
    topology:    'Hospitality',
    category:    'Hospitality',
    size:        '2400 m²',
    year:        2024,
    status:      'Completed',
    imageNums:   [8, 42, 43, 44],
    featured:    true,
  },
  {
    slug:        'the-grove',
    title:       'The Grove Residence',
    subtitle:    'A house built around three trees',
    description: 'The owners refused to clear the breadfruit and frangipani that had stood there for forty years. So the house wraps the canopy. Terraces shaded by leaves; a plan that bends to make room.',
    location:    'Pererenan, Bali',
    topology:    'Houses',
    category:    'Residential',
    size:        '400 m²',
    year:        2023,
    status:      'Completed',
    imageNums:   [9, 45, 46, 47],
  },
  {
    slug:        'k-house',
    title:       'K House',
    subtitle:    'A corner lot, resolved',
    description: 'A modest plot at the meeting of two Sanur lanes. The house turns its back to the street and opens an internal courtyard for light and air — the urban move dressed in domestic clothing.',
    location:    'Sanur, Bali',
    topology:    'Houses',
    category:    'Residential',
    size:        '290 m²',
    year:        2022,
    status:      'Completed',
    imageNums:   [10, 48, 49, 50],
  },
  {
    slug:        'studio-meja',
    title:       'Studio Meja',
    subtitle:    'A workspace that earns the day',
    description: 'A compact creative studio in central Denpasar. Borrowed light from a high north clerestory, terrazzo floors that take wear well, and a single long table around which every working day begins.',
    location:    'Denpasar, Bali',
    topology:    'Commercial',
    category:    'Commercial',
    size:        '150 m²',
    year:        2022,
    status:      'Completed',
    imageNums:   [11, 51, 52, 53],
  },
  {
    slug:        'pendopo-house',
    title:       'Pendopo House',
    subtitle:    'The pavilion as a contemporary act',
    description: 'A reinterpretation of the Javanese open hall. The central pendopo seats the family, the kitchen, and the garden — one large, slow-moving room that becomes the architectural heart of the home.',
    location:    'Gianyar, Bali',
    topology:    'Residential',
    category:    'Residential',
    size:        '510 m²',
    year:        2023,
    status:      'Completed',
    imageNums:   [12, 54, 55, 56],
  },
];

/* ── Properties (8) ──────────────────────────────────────────────────────── */

interface PropertySeed {
  slug:        string;
  title:       string;
  subtitle:    string;
  description: string;
  location:    string;
  topology:    PropertyTopology;
  size:        string;
  year:        number;
  status:      ProjectStatus;
  priceFrom:   string;
  bedrooms:    number;
  bathrooms:   number;
  carPort:     number;
  unitsTotal:  number;
  unitsSold:   number;
  imageNums:   number[];
  featured?:   boolean;
}

const PROPERTIES: PropertySeed[] = [
  {
    slug:        'aria-villas',
    title:       'Aria Villas',
    subtitle:    'Eight villas, one walled garden',
    description: 'A compound of eight private villas tucked behind a quiet Seminyak lane. Each unit carries its own pool, outdoor pavilion, and Muem-designed interior — built for personal use or high-yield short-let.',
    location:    'Seminyak, Bali',
    topology:    'Villa',
    size:        '280 m²',
    year:        2026,
    status:      'InProgress',
    priceFrom:   '$420,000',
    bedrooms:    3, bathrooms: 3, carPort: 1,
    unitsTotal:  8, unitsSold: 6,
    imageNums:   [13, 57, 58, 59],
    featured:    true,
  },
  {
    slug:        'soka-retreat',
    title:       'Soka Retreat',
    subtitle:    'A hillside delivered, an income proven',
    description: 'Twelve completed villas above the Tabanan rice terraces. Operating as a premium eco-retreat with a 90%+ occupancy track record — a turnkey investment with documented yield.',
    location:    'Tabanan, Bali',
    topology:    'Villa',
    size:        '220 m²',
    year:        2024,
    status:      'Completed',
    priceFrom:   '$380,000',
    bedrooms:    2, bathrooms: 2, carPort: 1,
    unitsTotal:  12, unitsSold: 12,
    imageNums:   [14, 60, 61, 62],
  },
  {
    slug:        'blue-nusa',
    title:       'Blue Nusa Residences',
    subtitle:    'Six villas on a car-free island',
    description: 'A boutique pre-sale on the north coast of Nusa Lembongan. Direct sea access, panoramic views back to the mainland, and the slower clock of island life. Early-stage entry to a fast-growing destination.',
    location:    'Nusa Lembongan, Bali',
    topology:    'Villa',
    size:        '160 m²',
    year:        2026,
    status:      'Concept',
    priceFrom:   '$295,000',
    bedrooms:    2, bathrooms: 2, carPort: 0,
    unitsTotal:  6, unitsSold: 2,
    imageNums:   [15, 63, 64, 65],
  },
  {
    slug:        'kila-beach',
    title:       'Kila Beach Estates',
    subtitle:    'Beachfront, south Lombok',
    description: 'Ten villas on a rare stretch of white sand south coast. Two- to four-bedroom configurations, private gardens, and direct beach access. Designed to perform as both a personal residence and a high-end rental.',
    location:    'Lombok, Indonesia',
    topology:    'Villa',
    size:        '310 m²',
    year:        2025,
    status:      'InProgress',
    priceFrom:   '$510,000',
    bedrooms:    4, bathrooms: 4, carPort: 2,
    unitsTotal:  10, unitsSold: 8,
    imageNums:   [16, 66, 67, 68],
  },
  {
    slug:        'desa-hijau',
    title:       'Desa Hijau',
    subtitle:    'A green village on the forest edge',
    description: 'Four homes on the wild fringe of Ubud, designed in partnership with a local land custodian. Passive ventilation, reclaimed materials, and a shared permaculture garden tying the cluster together.',
    location:    'Ubud, Bali',
    topology:    'Townhouse',
    size:        '190 m²',
    year:        2026,
    status:      'Concept',
    priceFrom:   '$260,000',
    bedrooms:    3, bathrooms: 2, carPort: 1,
    unitsTotal:  4, unitsSold: 0,
    imageNums:   [17, 69, 70, 71],
    featured:    true,
  },
  {
    slug:        'the-lomb',
    title:       'The Lomb',
    subtitle:    'Design-led apartments in Kuta Lombok',
    description: 'Sixteen units across four floors, sold out before completion and now delivering steady rental returns. Rooftop pool, shared coworking, and a surf storage room — a building shaped by its tenants.',
    location:    'Kuta, Lombok',
    topology:    'Apartment',
    size:        '75 m²',
    year:        2024,
    status:      'Completed',
    priceFrom:   '$155,000',
    bedrooms:    1, bathrooms: 1, carPort: 0,
    unitsTotal:  16, unitsSold: 16,
    imageNums:   [18, 72, 73, 1],
  },
  {
    slug:        'pererenan-heights',
    title:       'Pererenan Heights',
    subtitle:    'Five villas above the surf break',
    description: 'A ridge site overlooking the Pererenan break, divided into five independent villas. Floor-to-ceiling glass, cantilevered decks, raw stone and weathered timber. Two units still available.',
    location:    'Canggu, Bali',
    topology:    'Villa',
    size:        '240 m²',
    year:        2025,
    status:      'InProgress',
    priceFrom:   '$390,000',
    bedrooms:    3, bathrooms: 3, carPort: 1,
    unitsTotal:  5, unitsSold: 3,
    imageNums:   [19, 2, 3, 4],
  },
  {
    slug:        'villa-ombak',
    title:       'Villa Ombak',
    subtitle:    'A trio of villas on Gili Trawangan',
    description: 'Three intimate villas on the largest of the Gili Islands. Car-free, sand-floored, and surprisingly resilient as a luxury destination. Two units remain at the pre-sale price point.',
    location:    'Gili Trawangan',
    topology:    'Villa',
    size:        '200 m²',
    year:        2026,
    status:      'Concept',
    priceFrom:   '$340,000',
    bedrooms:    3, bathrooms: 3, carPort: 0,
    unitsTotal:  3, unitsSold: 1,
    imageNums:   [20, 5, 6, 7],
  },
];

/* ── Furniture (12) ──────────────────────────────────────────────────────── */

interface FurnitureSeed {
  slug:        string;
  name:        string;
  collection:  string;
  category:    FurnitureCategory;
  material:    string;
  price:       string;
  subtitle:    string;
  description: string;
  dimensions:  string;
  finish:      string;
  leadTime:    string;
  origin:      string;
  imageNums:   number[];
  featured?:   boolean;
}

const FURNITURE: FurnitureSeed[] = [
  {
    slug:        'rosita-lounge-chair',
    name:        'Rosita Lounge Chair',
    collection:  'Oakwood Series',
    category:    'Chairs',
    material:    'Charter Wood',
    price:       '$4,020',
    subtitle:    'Repose, made considered',
    description: 'Three prototype rounds to find the exact angle that holds without rigidity. Solid Charter Wood arms; a seat proportioned for long evenings. Looks deliberate empty, inevitable once you sit.',
    dimensions:  'W 82 × D 88 × H 74 cm · Seat H 40 cm',
    finish:      'Natural grain, satin wax',
    leadTime:    '6–8 weeks',
    origin:      'Handcrafted in Java, Indonesia',
    imageNums:   [1, 3, 4],
    featured:    true,
  },
  {
    slug:        'volta-dining-chair',
    name:        'Volta Dining Chair',
    collection:  'Volta Series',
    category:    'Chairs',
    material:    'PVC Duo',
    price:       '$920',
    subtitle:    'Single-form, no joins',
    description: 'A shell moulded in one continuous gesture — no joins, no compromise. Pairs cleanly with the Saya dining table and reads as sculpture when the room is empty.',
    dimensions:  'W 46 × D 52 × H 80 cm · Seat H 46 cm',
    finish:      'Matte lacquer',
    leadTime:    '4–6 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
    imageNums:   [5, 6],
  },
  {
    slug:        'merano-accent-chair',
    name:        'Merano Accent Chair',
    collection:  'Stone Edit',
    category:    'Chairs',
    material:    'Polished Concrete',
    price:       '$3,600',
    subtitle:    'Stillness, made solid',
    description: 'A single organic curve cast in polished concrete. The Merano asks little, gives presence — equal parts seating and standing object.',
    dimensions:  'W 58 × D 62 × H 78 cm · Seat H 44 cm',
    finish:      'Honed concrete, penetrating sealer',
    leadTime:    '8–10 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
    imageNums:   [7, 8],
  },
  {
    slug:        'saya-dining-table',
    name:        'Saya Dining Table',
    collection:  'Oakwood Series',
    category:    'Tables',
    material:    'Limestone',
    price:       '$6,800',
    subtitle:    'The table the room gathers around',
    description: 'Eight at ease, ten when the night is good. A single quarry slab worked by hand — no two Sayas share veining. Oak legs joined mortise-and-tenon; no metal fasteners.',
    dimensions:  'W 220 × D 100 × H 75 cm',
    finish:      'Honed limestone, oil-treated oak',
    leadTime:    '8–12 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
    imageNums:   [9, 10, 11],
    featured:    true,
  },
  {
    slug:        'nesta-side-table',
    name:        'Nesta Side Table',
    collection:  'Volta Series',
    category:    'Tables',
    material:    'Charter Wood',
    price:       '$1,200',
    subtitle:    'Small form, strong character',
    description: 'Charter Wood in a slim rectangular profile, with a lower shelf for books or objects. The table you put beside the reading chair and forget — until guests ask where it\'s from.',
    dimensions:  'W 45 × D 45 × H 55 cm',
    finish:      'Matte oil, natural grain',
    leadTime:    '3–5 weeks',
    origin:      'Handcrafted in Java, Indonesia',
    imageNums:   [12, 13],
  },
  {
    slug:        'arco-console',
    name:        'Arco Console',
    collection:  'Stone Edit',
    category:    'Consoles',
    material:    'Polished Concrete',
    price:       '$3,900',
    subtitle:    'An entrance worth the walk',
    description: 'A single pour, arched at the apron for visual relief. The Arco brings the Stone Edit\'s material honesty to your entryway or living wall — heavy, finished, permanent-feeling.',
    dimensions:  'W 140 × D 38 × H 82 cm',
    finish:      'Polished concrete, clear sealer',
    leadTime:    '8–10 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
    imageNums:   [14, 15],
  },
  {
    slug:        'koto-console',
    name:        'Koto Entry Console',
    collection:  'Oakwood Series',
    category:    'Consoles',
    material:    'Charter Wood',
    price:       '$2,600',
    subtitle:    'The first thing the door opens onto',
    description: 'Narrow footprint, generous surface, single lower rail for bags or baskets. Hand-rubbed Charter Wood that deepens with age.',
    dimensions:  'W 120 × D 36 × H 80 cm',
    finish:      'Natural grain, hand-rubbed oil',
    leadTime:    '5–7 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
    imageNums:   [16, 17, 18],
  },
  {
    slug:        'reva-shelving-unit',
    name:        'Reva Shelving Unit',
    collection:  'Volta Series',
    category:    'Shelving',
    material:    'PVC Duo',
    price:       '$2,100',
    subtitle:    'Display, without clutter',
    description: 'Five open shelves on concealed fixings — the unit appears to float. PVC Duo lighter than its silhouette suggests, strong enough to hold a serious collection.',
    dimensions:  'W 90 × D 28 × H 180 cm',
    finish:      'Matte lacquer, concealed wall anchors',
    leadTime:    '5–7 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
    imageNums:   [19, 21],
  },
  {
    slug:        'luma-wall-shelf',
    name:        'Luma Wall Shelf',
    collection:  'Stone Edit',
    category:    'Shelving',
    material:    'Limestone',
    price:       '$880',
    subtitle:    'One shelf, done right',
    description: 'A single slab cantilevered from a hidden steel bracket. The Luma is deceptively simple — the material weight makes it feel permanent, the silhouette makes it feel inevitable.',
    dimensions:  'W 80 × D 22 × H 4 cm',
    finish:      'Honed limestone, matte sealer',
    leadTime:    '4–6 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
    imageNums:   [22, 23],
  },
  {
    slug:        'brea-sofa',
    name:        'Brea Modular Sofa',
    collection:  'Oakwood Series',
    category:    'Sofas',
    material:    'Charter Wood',
    price:       '$9,400',
    subtitle:    'The room starts here',
    description: 'Three modules that combine to seat four or six — or pull apart as the room evolves. Charter Wood base, natural linen cushions deep enough for the long version of the conversation.',
    dimensions:  'W 280 × D 95 × H 72 cm (3-seat) · Seat H 38 cm',
    finish:      'Charter Wood base, natural linen upholstery',
    leadTime:    '10–14 weeks',
    origin:      'Handcrafted in Central Java, Indonesia',
    imageNums:   [24, 26, 28],
    featured:    true,
  },
  {
    slug:        'duna-loveseat',
    name:        'Duna Loveseat',
    collection:  'Volta Series',
    category:    'Sofas',
    material:    'PVC Duo',
    price:       '$5,200',
    subtitle:    'Two-seater intimacy',
    description: 'Built for bedrooms and reading corners where a full sofa would dominate. PVC Duo frame keeps the silhouette light; a deep cushion invites stays longer than planned.',
    dimensions:  'W 158 × D 88 × H 68 cm · Seat H 40 cm',
    finish:      'PVC Duo frame, bouclé upholstery',
    leadTime:    '7–9 weeks',
    origin:      'Handcrafted in Yogyakarta, Indonesia',
    imageNums:   [29, 30],
  },
  {
    slug:        'arca-planter',
    name:        'Arca Planter Set',
    collection:  'Stone Edit',
    category:    'Extras',
    material:    'Polished Concrete',
    price:       '$640',
    subtitle:    'For living things, given the right home',
    description: 'Three vessels in graduating heights, each cast with an internal drainage system and removable liner. Works as a tableau, or distributed across a room — indoors or sheltered outside.',
    dimensions:  'Small ⌀ 18 × 22 cm · Medium ⌀ 24 × 30 cm · Large ⌀ 32 × 40 cm',
    finish:      'Polished concrete, wax sealer, drainage insert',
    leadTime:    '3–4 weeks',
    origin:      'Handcrafted in Bali, Indonesia',
    imageNums:   [31, 33],
  },
];

/* ── Studio ──────────────────────────────────────────────────────────────── */

async function seedStudio() {
  console.log(`\n→ Seeding ${STUDIO.length} Studio Projects…`);
  for (let i = 0; i < STUDIO.length; i++) {
    const p = STUDIO[i];
    const data = {
      slug:        p.slug,
      title:       p.title,
      subtitle:    p.subtitle,
      description: p.description,
      location:    p.location,
      topology:    p.topology,
      category:    p.category,
      size:        p.size,
      year:        p.year,
      status:      p.status,
      images:      p.imageNums.map(prop),
      featured:    p.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.studioProject.upsert({
      where:  { slug: p.slug },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${p.title}`);
  }
}

/* ── Properties ──────────────────────────────────────────────────────────── */

async function seedProperties() {
  console.log(`\n→ Seeding ${PROPERTIES.length} Properties…`);
  for (let i = 0; i < PROPERTIES.length; i++) {
    const p = PROPERTIES[i];
    const data = {
      slug:        p.slug,
      title:       p.title,
      subtitle:    p.subtitle,
      description: p.description,
      location:    p.location,
      topology:    p.topology,
      size:        p.size,
      year:        p.year,
      status:      p.status,
      priceFrom:   p.priceFrom,
      bedrooms:    p.bedrooms,
      bathrooms:   p.bathrooms,
      carPort:     p.carPort,
      unitsTotal:  p.unitsTotal,
      unitsSold:   p.unitsSold,
      images:      p.imageNums.map(prop),
      featured:    p.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.property.upsert({
      where:  { slug: p.slug },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${p.title}`);
  }
}

/* ── Furniture ───────────────────────────────────────────────────────────── */

async function seedFurniture() {
  console.log(`\n→ Seeding ${FURNITURE.length} Furniture items…`);
  for (let i = 0; i < FURNITURE.length; i++) {
    const f = FURNITURE[i];
    const data = {
      slug:        f.slug,
      name:        f.name,
      collection:  f.collection,
      category:    f.category,
      material:    f.material,
      price:       f.price,
      subtitle:    f.subtitle,
      description: f.description,
      dimensions:  f.dimensions,
      finish:      f.finish,
      leadTime:    f.leadTime,
      origin:      f.origin,
      images:      f.imageNums.map(furn),
      featured:    f.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.furniture.upsert({
      where:  { slug: f.slug },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${f.name}`);
  }
}

/* ── Featured slots — first 8 published per FeaturedCategory ─────────────── */

async function seedFeaturedSlots() {
  console.log('\n→ Seeding FeaturedSlot picks from Studio Projects…');
  await prisma.featuredSlot.deleteMany();

  const TARGET = 8;
  const cats: ('Residential' | 'Hospitality' | 'Commercial')[] = [
    'Residential', 'Hospitality', 'Commercial',
  ];

  for (const cat of cats) {
    const projects = await prisma.studioProject.findMany({
      where:   { category: cat, deletedAt: null, publishedAt: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      take:    TARGET,
    });

    if (projects.length < TARGET) {
      console.log(`  ! ${cat}: only ${projects.length}/${TARGET} published`);
    }

    for (let i = 0; i < projects.length; i++) {
      await prisma.featuredSlot.create({
        data: { category: cat, projectId: projects[i].id, sortOrder: i },
      });
      console.log(`  ✓ ${projects[i].title} → ${cat} (#${i + 1})`);
    }
  }
}

/* ── Dummy contact submissions ───────────────────────────────────────────── */

async function seedDummySubmissions() {
  const existing = await prisma.contactSubmission.count();
  if (existing > 0) {
    console.log('\n→ Skipping dummy submissions (inbox not empty)');
    return;
  }
  console.log('\n→ Seeding 3 dummy contact submissions…');
  await prisma.contactSubmission.createMany({
    data: [
      {
        name:       'Anya Kusumawardani',
        email:      'anya@example.com',
        lookingFor: 'Start a project',
        message:    'Hi Muem,\n\nWe own a plot in Pererenan and would love to discuss a 4-bedroom villa, target completion late 2026. Land area is 850 m². Could we schedule a site visit and conceptual conversation?\n\nThanks,\nAnya',
        read:       false,
      },
      {
        name:       'Marcus Hale',
        email:      'mhale@hale-investments.com',
        lookingFor: 'Invest / Buy a Property',
        message:    'Hello,\n\nFamily office looking for 2–3 villa investments in Bali for the long-haul. Any pre-sale opportunities you can share? Especially interested in Uluwatu and Canggu.\n\nBest,\nMarcus',
        read:       true,
      },
      {
        name:       'Studio Bali Design Co.',
        email:      'hello@balistudio.co',
        lookingFor: 'Collaboration',
        message:    'Hi team,\n\nWe\'re a small interior design practice in Seminyak. Loved your work at The Layar — would there be an opportunity to chat about referrals or collaborative projects?\n\nWarm regards,\nThe Studio Bali team',
        read:       false,
      },
    ],
  });
}

async function main() {
  await seedStudio();
  await seedProperties();
  await seedFurniture();
  await seedFeaturedSlots();
  await seedDummySubmissions();
  console.log('\n✓ Content seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
