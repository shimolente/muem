/**
 * Auth.js v5 catch-all route handler.
 * Delegates to the GET/POST handlers exposed by lib/auth.ts.
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
