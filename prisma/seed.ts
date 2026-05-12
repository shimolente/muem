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
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
