/**
 * Extend Auth.js types so `session.user.role` and `token.id` / `token.role`
 * carry the Prisma `Role` enum.
 */

import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id:    string;
      email: string;
      name?: string | null;
      role:  Role;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:   string;
    role: Role;
  }
}
