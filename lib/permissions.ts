/**
 * Permission helpers — call at the start of every Server Action / Route Handler
 * that mutates or reads protected data.
 */

import type { Role } from '@prisma/client';

/**
 * Throws if the role is not ADMIN.
 * Use after `auth()` confirms there's a session.
 */
export function requireAdmin(role: Role | undefined): asserts role is 'ADMIN' {
  if (role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
}
