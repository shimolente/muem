# Calicu Space — CLAUDE.md

> Operational manual for Claude Code and any AI assistant. Read before every task.

---

## Project Identity

**Name**: Calicu Space  
**Type**: Creative platform — Snail Mail Club subscriptions, Video Classes, Digital Resources, Portfolio  
**Client**: Eileen Widjaja  
**Developer**: Making Minds Studio  

---

## Brand (source of truth: `00_BRAND ASSETS/`)

The brand pack supersedes any palette/typography in PRD.md. If they conflict, brand pack wins.

### Palette

**Primary**
| Token | Hex | Use |
|-------|-----|-----|
| `cream` | `#F6F6EE` | Page bg |
| `yellow` | `#FCF58B` | Accent / highlight |
| `orange` | `#FFC072` | Accent / warm CTA |
| `pink` | `#F56B81` | Brand accent / primary CTA |
| `blue` | `#4163A9` | Brand primary / headings on cream |

**Secondary**
| Token | Hex | Use |
|-------|-----|-----|
| `gray-soft` | `#99A2A9` | Muted text / borders |
| `pink-soft` | `#FAA5B5` | Soft accent / badges |
| `sky` | `#A1D1FF` | Info / link tint |
| `lilac` | `#9A9AFF` | Decorative |
| `deep` | `#382B63` | Dark surface / footer / heading on cream |

### Typography

- **Display / heading**: Clash Display (Semibold default; Bold for hero). Local `.otf` files in `00_BRAND ASSETS/Typeface/` — copied to `src/app/fonts/`.
- **Body / UI**: Inter (Regular + Semibold). Loaded via `next/font/google`.
- CSS vars: `--font-display`, `--font-body`. Tailwind: `font-display`, `font-body`.

### Logos & mascot

- Logos in `public/brand/` (logogram, horizontal, secondary). Logogram = favicon + small spaces.
- Mascot = calico cat (maneki-neko style), 15 expressions in `00_BRAND ASSETS/Mascot/`. Use sparingly for empty states, errors, success moments.
- Supergraphics in `00_BRAND ASSETS/` (`Supergraphic1.png`, `Supergraphic2.png`) — decorative section dividers.

---

## Tech Stack (LOCKED)

Do not change without explicit approval.

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router, Turbopack) | 15.x |
| Language | TypeScript (strict) | 5.x |
| Runtime | Node.js | 20+ LTS |
| Package manager | pnpm | 10.x |
| Database | PostgreSQL via Supabase | 16 |
| ORM | Prisma | 6.x |
| Authentication | Auth.js (NextAuth) v5 | 5.x beta |
| Validation | Zod | 4.x |
| Forms | React Hook Form + @hookform/resolvers | latest |
| Data fetching | TanStack Query (client) + Server Actions | 5.x |
| Styling | Tailwind CSS + shadcn/ui (New York) | 4.x |
| Rich text editor | TipTap + tiptap-markdown | 3.x |
| Rich text render | react-markdown | 10.x |
| Icons | lucide-react | latest |
| Toast | sonner | latest |
| Date utils | date-fns + date-fns-tz | 4.x |
| Image processing | sharp | 0.34.x |
| File storage | Supabase Storage | - |
| Payments | Midtrans Snap + Core API | - |
| Email | Resend | latest |
| Hosting | Vercel | - |

---

## Roles & Auth

Three roles. Auth.js v5, email + password only. No phone/PIN.

| Role | Access |
|------|--------|
| `ADMIN` | Full admin panel + settings + user management |
| `STAFF` | Admin panel — content + orders only (no settings, no users) |
| `CUSTOMER` | Public site + `/me/*` portal |

- `/me/*` → requires any authenticated session
- `/admin/*` → requires `ADMIN` or `STAFF`
- Middleware in `src/middleware.ts` handles redirects

**Always** check role at action/route boundary. UI hiding is not security.

---

## Directory Structure

```
calicu-space/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── (logo, favicon, og-image)
├── src/
│   ├── app/
│   │   ├── (public)/              # No auth — landing, about, contact, classes, snail-mail, resources
│   │   ├── (customer)/            # CUSTOMER role — /me/*
│   │   ├── (admin)/               # ADMIN|STAFF — /admin/*
│   │   ├── api/                   # Route handlers ONLY (webhooks, uploads, signed URLs)
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn primitives — DO NOT edit by hand
│   │   ├── admin/                 # Admin-area components
│   │   ├── customer/              # Customer portal components
│   │   └── shared/                # Nav, footer, cross-area components
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # Auth.js config
│   │   ├── utils.ts               # cn() + small utils
│   │   ├── midtrans.ts            # Midtrans Snap helper
│   │   ├── storage.ts             # Supabase Storage — upload + signed URL helpers
│   │   ├── email/
│   │   │   ├── resend.ts          # Resend client
│   │   │   └── templates/         # Email template functions
│   │   ├── loyalty.ts             # Points earn/redeem logic
│   │   ├── vouchers.ts            # Voucher validation logic
│   │   └── permissions.ts         # requireRole, hasRole helpers
│   ├── server/
│   │   ├── actions/               # Server actions grouped by feature
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── snail-mail/
│   │   │   ├── resources/
│   │   │   ├── alumni/
│   │   │   ├── contact/
│   │   │   ├── loyalty/
│   │   │   └── vouchers/
│   │   └── queries/               # Read-side RSC query helpers
│   ├── hooks/
│   ├── types/                     # Shared TS types (not Prisma-generated)
│   └── middleware.ts
├── .env.local
├── .env.example
├── CLAUDE.md                      # This file
├── PRD.md                         # Full product spec
└── README.md
```

---

## API Design Rules

**Use Server Actions** for everything except:
- Webhooks (Midtrans → `POST /api/webhook/midtrans`)
- Signed URL generation (file downloads → `GET /api/resources/[id]/download`, `GET /api/lessons/[itemId]/file`)
- File uploads (`POST /api/upload/image`, `POST /api/upload/file`)

Route Handlers live in `src/app/api/`.

---

## Server Action Pattern

Every action follows this exact pattern:

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

const inputSchema = z.object({ /* ... */ });

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function exampleAction(
  raw: z.infer<typeof inputSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { ok: false, error: "UNAUTHORIZED" };
  requireRole(session.user.role, ["ADMIN", "STAFF"]);

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await prisma.something.create({ data: parsed.data });
    revalidatePath("/admin/something");
    return { ok: true, data: { id: result.id } };
  } catch (e) {
    console.error("[exampleAction]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
```

Never throw to client. Always return discriminated union.

---

## Midtrans Order ID Format

Encode metadata in order ID — webhook parses it back:

```
calicu-course-{userId}-{courseId}-{timestamp}
calicu-sub-{userId}-{productId}-{timestamp}
calicu-res-{userId}-{resourceId}-{timestamp}
```

Webhook signature verification:
```ts
SHA512(orderId + statusCode + grossAmount + MIDTRANS_SERVER_KEY)
```

Handled events: `settlement` (GoPay/QRIS/transfer), `capture + fraud_status:accept` (card).  
Always check for existing record by `midtransOrderId` before writing — idempotent.

---

## File Storage Rules

Two Supabase buckets:

| Bucket | Access | Contains |
|--------|--------|----------|
| `public-media` | Public read | Thumbnails, gallery, avatars, alumni photos |
| `protected-files` | Private | PDF lessons, resource files |

**Never** return `storagePath` to client.  
**Never** generate public URLs for `protected-files`.  
Signed URLs only — 10-min expiry for resources, 15-min for lessons.  
Always verify purchase/access before generating signed URL.

---

## Video Embedding Rules

- Embed only via `youtube-nocookie.com/embed/{videoId}`
- Always add transparent overlay `div` (`position: absolute; inset: 0; z-index: 10`) to block right-click
- Never embed if user has no purchase — server-render the iframe only after access check
- Raw `videoId` may be in HTML source — this is acceptable at current scale

---

## Database Conventions

- Every model: `id` (CUID), `createdAt`, `updatedAt`
- Soft-delete with `deletedAt DateTime?` for user-facing entities (users, courses, resources, alumni, testimonials)
- Hard-delete OK for: sessions, expired records, orphaned media
- Enums for all closed value sets — no magic strings
- All FK `onDelete: Restrict` by default — change explicitly when cascade needed
- Prices in IDR as plain `Int` (no decimals)
- Loyalty points as plain `Int`

---

## TypeScript Conventions

- `strict: true` — no `any` without comment justification
- `type` over `interface` except class-like contracts
- `import type { ... }` for type-only imports
- IDs: `string` (CUIDs) — never `number`
- Model IDs from Prisma via `@/lib/prisma` — not re-declared in `src/types/`

---

## React Conventions

- **Server Components by default.** `"use client"` only for: state, effects, browser APIs, interactive event handlers
- Forms: React Hook Form + Zod resolver + Server Action handler
- Loading: `loading.tsx` per route segment + `<Suspense>` boundaries
- Client mutations: `useTransition` for pending state
- Errors: `error.tsx` per segment; `notFound()` for 404

---

## File & Symbol Naming

- Files: `kebab-case` (`course-card.tsx`, `create-course.ts`)
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/interfaces/enums: `PascalCase`
- Routes: `kebab-case` (`/admin/snail-mail`)

---

## Import Order

```ts
// 1. Node / external packages
import { redirect } from "next/navigation";
import { z } from "zod";

// 2. @/ aliased internal
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 3. Relative
import { courseSchema } from "./schemas";

// 4. Type-only (bottom of each section)
import type { Course } from "@prisma/client";
```

---

## Mobile-First Rules

- Build every customer page for 375px viewport first
- Use Tailwind responsive prefixes: `sm:` `md:` `lg:` `xl:`
- Nav: hamburger on mobile (`md:hidden`), full horizontal on `md:`
- Touch targets: min 44px height/width
- No horizontal scroll permitted on any page
- Admin panel: functional on 768px+, optimised for desktop

---

## Common Commands

```bash
# Dev
pnpm dev                    # Next.js dev (Turbopack)

# Database
pnpm db:generate            # Regenerate Prisma client
pnpm db:migrate             # Create + apply migration (dev)
pnpm db:deploy              # Apply pending migrations (prod)
pnpm db:studio              # Prisma Studio GUI
pnpm db:seed                # Run seed
pnpm db:reset               # ⚠️ DESTRUCTIVE — drop + recreate (dev only)

# Build
pnpm build                  # Production build
pnpm lint                   # ESLint
pnpm typecheck              # tsc --noEmit

# shadcn
pnpm dlx shadcn@latest add <component>
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=               # Supabase PostgreSQL connection string

# Auth.js
NEXTAUTH_SECRET=            # Random secret
NEXTAUTH_URL=               # https://calicu.space

# Midtrans
MIDTRANS_SERVER_KEY=        # Mid-server-...
MIDTRANS_CLIENT_KEY=        # Mid-client-...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=  # Same as above (client-side Snap)
MIDTRANS_IS_PRODUCTION=     # false (sandbox) | true (production)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only — never NEXT_PUBLIC_

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=          # hello@calicu.space

# App
NEXT_PUBLIC_BASE_URL=       # https://calicu.space
```

---

## DO ✅

- Server Components and Server Actions wherever possible
- Validate every input with Zod before touching DB
- Check role at every action/route boundary
- `revalidatePath()` after every mutation affecting cached pages
- Soft-delete user-facing entities
- Add `loading.tsx` next to every new `page.tsx`
- Verify purchase/access server-side before returning any gated content
- Use signed URLs for all protected file delivery
- Run `pnpm typecheck` and `pnpm lint` before marking any feature done
- Keep `midtransOrderId` unique and idempotency-checked in webhook

---

## DON'T ❌

- Don't expose `storagePath` or raw Supabase Storage URLs to client
- Don't skip auth checks ("I'll add it later")
- Don't use `any` without comment
- Don't hardcode Eileen's name, brand copy, or prices in components — use CMS data or config
- Don't add `useEffect` for data fetching — use RSC or TanStack Query
- Don't use `<form action="...">` with raw URLs — Server Actions only
- Don't put secrets in `NEXT_PUBLIC_*` variables
- Don't introduce new dependencies without justification
- Don't push without local build passing

---

## When Unsure

1. Check `prisma/schema.prisma` for data model
2. Check `src/lib/permissions.ts` for role logic
3. Check an analogous existing feature for patterns
4. Check `PRD.md` for full feature spec
5. If still ambiguous — ask. Don't guess on architecture.
