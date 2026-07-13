import path from 'node:path';
import type { PrismaConfig } from 'prisma';

/**
 * Prisma configuration (replaces the deprecated `package.json#prisma` key,
 * removed in Prisma 7). The seed command keeps the dotenv wrapper so local
 * `prisma db seed` / `migrate reset` load `.env.local` exactly as before.
 */
export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'dotenv -e .env.local -- tsx prisma/seed.ts',
  },
} satisfies PrismaConfig;
