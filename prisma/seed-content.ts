/**
 * Migrate existing hardcoded content from /content/*.ts into Postgres.
 * Idempotent — safe to re-run, upserts by slug.
 *
 * Usage: npm run db:seed-content
 */

import { PrismaClient } from '@prisma/client';
import type { ProjectCategory, ProjectStatus, PropertyTopology } from '@prisma/client';
import { STUDIO_PROJECTS }    from '../content/studio';
import { RESIDENCES_PROJECTS } from '../content/residences';
import { FURNITURE_ITEMS }    from '../content/furniture';

const prisma = new PrismaClient();

/* ── Mappers ──────────────────────────────────────────────────────────── */

function mapProjectCategory(topology: string): ProjectCategory | null {
  const t = topology.toLowerCase();
  if (['villas', 'houses', 'apartments', 'residential'].includes(t)) return 'Residential';
  if (t === 'hospitality') return 'Hospitality';
  if (t === 'commercial')  return 'Commercial';
  if (t === 'retail')      return 'Retail';
  if (t === 'f&b' || t.includes('restaurant')) return 'FoodAndBeverage';
  return null;
}

function mapStatus(raw: string | undefined): ProjectStatus {
  if (!raw)                              return 'Completed';
  const s = raw.toLowerCase();
  if (s === 'completed')                 return 'Completed';
  if (s === 'in progress' || s === 'inprogress' || s.startsWith('completion')) return 'InProgress';
  if (s === 'concept' || s === 'pre-sale') return 'Concept';
  return 'Completed';
}

function mapPropertyTopology(topology: string): PropertyTopology | null {
  const t = topology.toLowerCase();
  if (t === 'villas')      return 'Villa';
  if (t === 'apartments')  return 'Apartment';
  if (t === 'houses')      return 'Townhouse';   // closest fit in enum
  if (t === 'land')        return 'Land';
  if (t === 'commercial')  return 'Commercial';
  return null;
}

/* ── Studio Projects ──────────────────────────────────────────────────── */

async function seedStudio() {
  console.log(`\n→ Seeding ${STUDIO_PROJECTS.length} Studio Projects…`);
  for (let i = 0; i < STUDIO_PROJECTS.length; i++) {
    const p = STUDIO_PROJECTS[i];
    const data = {
      slug:        p.id,
      title:       p.title,
      subtitle:    p.subtitle    ?? null,
      description: p.description ?? null,
      location:    p.location,
      topology:    p.topology,
      category:    mapProjectCategory(p.topology),
      size:        p.size,
      year:        p.year,
      status:      mapStatus(p.status),
      images:      p.images,
      featured:    p.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.studioProject.upsert({
      where:  { slug: p.id },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${p.title}`);
  }
}

/* ── Properties ───────────────────────────────────────────────────────── */

async function seedProperties() {
  console.log(`\n→ Seeding ${RESIDENCES_PROJECTS.length} Properties…`);
  for (let i = 0; i < RESIDENCES_PROJECTS.length; i++) {
    const p = RESIDENCES_PROJECTS[i];
    const data = {
      slug:        p.id,
      title:       p.title,
      subtitle:    p.subtitle    ?? null,
      description: p.description ?? null,
      location:    p.location,
      topology:    mapPropertyTopology(p.topology),
      size:        p.size,
      year:        p.year,
      status:      mapStatus(p.status),
      priceFrom:   p.priceFrom   ?? null,
      bedrooms:    p.bedrooms    ?? null,
      bathrooms:   p.bathrooms   ?? null,
      carPort:     p.carPort     ?? null,
      unitsTotal:  p.unitsTotal,
      unitsSold:   p.unitsSold,
      images:      p.images,
      featured:    p.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.property.upsert({
      where:  { slug: p.id },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${p.title}`);
  }
}

/* ── Furniture ────────────────────────────────────────────────────────── */

async function seedFurniture() {
  console.log(`\n→ Seeding ${FURNITURE_ITEMS.length} Furniture items…`);
  for (let i = 0; i < FURNITURE_ITEMS.length; i++) {
    const f = FURNITURE_ITEMS[i];
    const data = {
      slug:        f.id,
      name:        f.name,
      collection:  f.collection,
      category:    f.category,
      material:    f.material,
      price:       f.price,
      subtitle:    f.subtitle    ?? null,
      description: f.description ?? null,
      dimensions:  f.dimensions  ?? null,
      finish:      f.finish      ?? null,
      leadTime:    f.leadTime    ?? null,
      origin:      f.origin      ?? null,
      images:      f.images,
      featured:    f.featured ?? false,
      sortOrder:   i,
      publishedAt: new Date(),
    };
    await prisma.furniture.upsert({
      where:  { slug: f.id },
      update: data,
      create: data,
    });
    console.log(`  ✓ ${f.name}`);
  }
}

/* ── Featured slots — first 8 published projects per FeaturedCategory ──── */

async function seedFeaturedSlots() {
  console.log('\n→ Seeding FeaturedSlot picks from Studio Projects…');
  // Wipe first — this section is fully derived
  await prisma.featuredSlot.deleteMany();

  const TARGET_PER_CATEGORY = 8;
  const categories: ('Residential' | 'Hospitality' | 'Commercial')[] = [
    'Residential', 'Hospitality', 'Commercial',
  ];

  for (const cat of categories) {
    const projects = await prisma.studioProject.findMany({
      where:   { category: cat, deletedAt: null, publishedAt: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      take:    TARGET_PER_CATEGORY,
    });

    if (projects.length < TARGET_PER_CATEGORY) {
      console.log(
        `  ! ${cat}: only ${projects.length}/${TARGET_PER_CATEGORY} published projects — seeding what exists`,
      );
    }

    for (let i = 0; i < projects.length; i++) {
      await prisma.featuredSlot.create({
        data: {
          category:  cat,
          projectId: projects[i].id,
          sortOrder: i,
        },
      });
      console.log(`  ✓ ${projects[i].title} → ${cat} (#${i + 1})`);
    }
  }
}

/* ── Dummy contact submissions ────────────────────────────────────────── */

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
  console.log('\n✓ Content migration complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
