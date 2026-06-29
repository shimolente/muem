import { z } from 'zod';

const STATUS    = ['Completed', 'InProgress', 'Concept'] as const;

export const propertySchema = z.object({
  /** Optional client-supplied id — see projects/schema.ts for rationale. */
  id:          z.string().regex(/^[a-z0-9]{8,32}$/i).optional(),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  title:       z.string().min(1, 'Title is required'),
  subtitle:    z.string().nullable(),
  description: z.string().nullable(),
  location:    z.string().nullable(),
  topology:    z.string().nullable(),  // validated against Category(kind: PROPERTY) in the action
  size:        z.string().nullable(),
  year:        z.number().int().min(1900).max(2100).nullable(),
  status:      z.enum(STATUS),
  priceFrom:   z.string().nullable(),
  bedrooms:    z.number().int().min(0).nullable(),
  bathrooms:   z.number().int().min(0).nullable(),
  carPort:     z.number().int().min(0).nullable(),
  unitsTotal:  z.number().int().min(0).nullable(),
  unitsSold:   z.number().int().min(0),
  developerPhone: z.string().nullable(),
  featured:    z.boolean(),
  published:   z.boolean(),
  images:      z.array(z.string()),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const PROPERTY_STATUSES   = STATUS;
