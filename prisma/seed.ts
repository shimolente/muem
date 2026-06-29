/**
 * Seed the single ADMIN user from env vars.
 * Idempotent — re-runnable to rotate the password.
 *
 * Usage: npx tsx prisma/seed.ts
 */
require('dotenv').config();
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';



const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash },
    create: { email, passwordHash, role: 'ADMIN' },
  });

  console.log(`✓ Admin user seeded: ${user.email}`);

  await seedCategories();
  await seedSettings();
}

/** Slugify a category label for the stable (kind, slug) key. */
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Seed the admin-managed category taxonomy from the original hardcoded enums.
 * Idempotent — upserts by (kind, slug). Also normalises the legacy studio
 * `FoodAndBeverage` value to its display label "F&B" so existing rows keep
 * matching their Category.
 */
async function seedCategories() {
  const TAXONOMY: Record<'STUDIO' | 'PROPERTY' | 'FURNITURE', string[]> = {
    STUDIO:    ['Residential', 'Hospitality', 'Commercial', 'F&B', 'Retail'],
    PROPERTY:  ['Villa', 'Apartment', 'Townhouse', 'Land', 'Commercial'],
    FURNITURE: ['Chairs', 'Tables', 'Consoles', 'Shelving', 'Sofas', 'Extras'],
  };

  for (const [kind, labels] of Object.entries(TAXONOMY) as [
    'STUDIO' | 'PROPERTY' | 'FURNITURE', string[],
  ][]) {
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const slug  = slugify(label);
      await prisma.category.upsert({
        where:  { kind_slug: { kind, slug } },
        update: { label, sortOrder: i },
        create: { kind, label, slug, sortOrder: i },
      });
    }
  }

  // Normalise legacy enum value → display label so existing studio rows match.
  await prisma.studioProject.updateMany({
    where: { category: 'FoodAndBeverage' },
    data:  { category: 'F&B' },
  });

  console.log('✓ Categories seeded (studio / property / furniture)');
}

/** Seed the single SiteSettings row with the values previously hardcoded. */
async function seedSettings() {
  const defaults = {
    socials: [
      { label: 'Instagram', href: 'https://instagram.com/muemstudio' },
      { label: 'WhatsApp',  href: 'https://wa.me/34686783520' },
    ],
    coconutsShared: 84,
    aboutStats: [
      { value: '3+',   label: 'Expertise',   tags: ['Architecture', 'Furniture', 'Real Estate'] },
      { value: '30+',  label: 'Projects',    tags: ['Residential', 'Hospitality', 'Commercial'] },
      { value: '15k+', label: 'Designed m²', tags: ['Rootedness', 'Sustainability', 'Refinement'] },
      { value: '10+',  label: 'Years',       tags: ['International', 'Experience'] },
    ],
    contactEmail:    'hi@muem.com',
    contactWhatsapp: '+34 686 78 35 20',
    contactLocation: 'Canggu, Bali',
  };

  await prisma.siteSettings.upsert({
    where:  { id: 'singleton' },
    update: {},                 // don't clobber admin edits on re-seed
    create: { id: 'singleton', ...defaults },
  });

  console.log('✓ Site settings seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
