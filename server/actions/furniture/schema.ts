import { z } from 'zod';

const CATEGORY = ['Chairs', 'Tables', 'Consoles', 'Shelving', 'Sofas', 'Extras'] as const;

export const furnitureSchema = z.object({
  /** Optional client-supplied id — see projects/schema.ts for rationale. */
  id:          z.string().regex(/^[a-z0-9]{8,32}$/i).optional(),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  name:        z.string().min(1, 'Name is required'),
  collection:  z.string().nullable(),
  category:    z.enum(CATEGORY),
  material:    z.string().nullable(),
  price:       z.string().nullable(),
  subtitle:    z.string().nullable(),
  description: z.string().nullable(),
  dimensions:  z.string().nullable(),
  finish:      z.string().nullable(),
  leadTime:    z.string().nullable(),
  origin:      z.string().nullable(),
  featured:    z.boolean(),
  published:   z.boolean(),
  images:      z.array(z.string()),
});

export type FurnitureInput = z.infer<typeof furnitureSchema>;

export const FURNITURE_CATEGORIES = CATEGORY;
