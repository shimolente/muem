import { z } from 'zod';

const STATUS    = ['Completed', 'InProgress', 'Concept'] as const;

/**
 * Schema is built so input === output (no z.coerce, no z.default).
 * Defaults live in form defaultValues + server action mapping.
 * This keeps RHF + zodResolver type inference clean.
 */
export const projectSchema = z.object({
  /** Optional client-supplied id — used so images uploaded against a
   *  draft id can be persisted as the real record id on create. Edit
   *  flow passes the existing id (no-op). Format must match the upload
   *  route's SAFE_ID guard (alphanumeric, 8–32 chars). */
  id:          z.string().regex(/^[a-z0-9]{8,32}$/i).optional(),
  slug:        z.string().min(1).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  title:       z.string().min(1, 'Title is required'),
  subtitle:    z.string().nullable(),
  description: z.string().nullable(),
  location:    z.string().nullable(),
  topology:    z.string().nullable(),
  category:    z.string().nullable(),  // validated against Category(kind: STUDIO) in the action
  size:        z.string().nullable(),
  year:        z.number().int().min(1900).max(2100).nullable(),
  status:      z.enum(STATUS),
  featured:    z.boolean(),
  published:   z.boolean(),
  images:      z.array(z.string()),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const PROJECT_STATUSES   = STATUS;
