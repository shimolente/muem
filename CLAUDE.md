# Muem Studio — CLAUDE.md

> Operational manual for Claude Code and any AI assistant. Read before every task.

---

## Project Identity

**Name**: Muem Studio
**Type**: Architecture studio + curated Properties + Furniture brand. Public marketing site + admin CMS.
**Public site**: Next.js 16 / React 19 / GSAP / CSS Modules — already shipped, do not refactor unless asked.
**CMS**: New custom build — Postgres + Prisma + Auth.js, scoped under `/admin/*`.

---

## Brand (source of truth: `styles/global.css` `:root` + `[data-design="v2"]`)

### Palette — v2 brandbook (production target)

| Token | Hex | Use |
|-------|-----|-----|
| `off-white` | `#F4F3F0` | Page bg / light surface |
| `brown-dark` | `#35322F` | Primary dark / body bg / nav text on light |
| `black` | `#323232` | Strongest text / hard surfaces |
| `green-light` | `#EBECEA` | Services bg / soft surface |
| `green-dark` | `#41443E` | Secondary dark / dividers |
| `overlay-dark` | `#2E3028` | Hover overlays on dark |

CSS variables already wired in `:root` and `[data-design="v2"]`. Do not introduce new color tokens without updating both blocks.

### Typography (already self-hosted in `styles/fonts.css`)

- **Display** (headings, statements): Aire Pro family
  - `--font-display-light` → hero headlines
  - `--font-display` (Roman) → mid-weight display
  - `--font-display-bold` → emphasis
  - Italic variants for pull quotes / statements
- **UI / body**: Brandon Grotesque via Adobe Typekit (`brandon-grotesque`)
- Aire has a `--aire-stroke: 1px` outline applied to `h1–h4` — keep when adding new headings.

### Type scale (fluid, from `:root`)

| Var | Range | Use |
|-----|-------|-----|
| `--text-hero` | clamp(48, 6.9vw, 100) | Hero headline |
| `--text-display` | clamp(28, 4.2vw, 64) | Section statements |
| `--text-heading` | clamp(18, 1.8vw, 28) | Section titles |
| `--text-body` | clamp(15, 1.2vw, 18) | Paragraphs |
| `--text-label` | clamp(12, 0.9vw, 14) | Nav, captions |

---

## Tech Stack (LOCKED)

Do not change without explicit approval. Public site stack already locked; CMS additions listed below.

### Public site (existing — leave as-is)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| UI | React | 19.x |
| Language | TypeScript (strict) | 5.x |
| Styling | CSS Modules + global CSS variables | — |
| Animation | GSAP + Lenis | 3.x / 1.x |
| State | Zustand | 5.x |

### CMS additions (new)

| Layer | Technology | Version |
|-------|------------|---------|
| Database | PostgreSQL via Supabase | 16 |
| ORM | Prisma | 6.x |
| Authentication | Auth.js (NextAuth) v5 | 5.x beta |
| Validation | Zod | 4.x |
| Forms | React Hook Form + @hookform/resolvers | latest |
| Data fetching | TanStack Query (client) + Server Actions | 5.x |
| Admin UI | Tailwind CSS + shadcn/ui (New York) | 4.x |
| Icons | lucide-react | latest |
| Toast | sonner | latest |
| Date utils | date-fns | 4.x |
| Image processing | sharp | 0.34.x |
| File storage | Supabase Storage | — |
| Email | Resend | latest |
| Hosting | Vercel | — |

**Tailwind scope**: only used inside `app/(admin)/**`. Public site routes keep CSS Modules. Do not add Tailwind classes to existing public components.

---

## Roles & Auth

Single-user admin. No public sign-up. Auth.js v5, email + password.

| Role | Access |
|------|--------|
| `ADMIN` | Full CMS — all entities, settings, contact submissions |

- `/admin/*` → requires authenticated `ADMIN` session
- All other routes → public, no auth
- Middleware in `middleware.ts` redirects unauthenticated `/admin/*` → `/admin/login`
- Seed exactly one `User { role: ADMIN }` via `prisma/seed.ts`. No registration UI.

**Always** check session at action/route boundary. UI hiding is not security.

---

## Entities (Prisma models)

Three primary content entities + featured-projects join + contact inbox.

### `StudioProject`
| Field | Type | Notes |
|-------|------|-------|
| id | cuid | |
| slug | string unique | URL slug |
| title | string | |
| subtitle | string? | Detail-page tagline |
| description | text? | Plain text only |
| location | string? | "Nusa Dua, Bali" |
| topology | string? | "Villa", "Hospitality", etc. |
| category | enum (`Residential`/`Hospitality`/`Commercial`/`F&B`/`Retail`) | |
| size | string? | "480 m²" |
| year | int? | |
| status | enum (`Completed`/`InProgress`/`Concept`) | default `Completed` |
| images | string[] | Storage paths, first = cover |
| featured | bool | default false |
| publishedAt | DateTime? | null = draft |
| deletedAt | DateTime? | soft delete |
| createdAt / updatedAt | timestamps | |

### `Property` (replaces "residenceProject" / "Properties")
All fields above except `category`, plus:
| Field | Type | Notes |
|-------|------|-------|
| topology | enum (`Villa`/`Apartment`/`Townhouse`/`Land`/`Commercial`) | |
| priceFrom | string? | "$420,000" — string to allow formatting |
| bedrooms | int? | |
| bathrooms | int? | |
| carPort | int? | |
| unitsTotal | int? | |
| unitsSold | int? | default 0 |

### `Furniture`
| Field | Type | Notes |
|-------|------|-------|
| id | cuid | |
| slug | string unique | |
| name | string | |
| collection | string? | "Oakwood Series" — free text, not FK (only 3 collections, low churn) |
| category | enum (`Chairs`/`Tables`/`Consoles`/`Shelving`/`Sofas`/`Extras`) | |
| material | string? | "Charter Wood" |
| price | string? | "$4,020" |
| subtitle | string? | |
| description | text? | |
| dimensions | string? | |
| finish | string? | |
| leadTime | string? | "6–8 weeks" |
| origin | string? | |
| images | string[] | |
| featured | bool | spans 2 columns in grid |
| publishedAt | DateTime? | |
| deletedAt | DateTime? | |
| createdAt / updatedAt | | |

### `FeaturedSlot` (homepage bento selection)

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | |
| category | enum (`Residential`/`Hospitality`/`Commercial`) | landing-page tab |
| projectId | FK → StudioProject | |
| sortOrder | int | manual order within category |
| createdAt | timestamp | |

Unique `(category, projectId)`. Admin reorders via drag — `sortOrder` rewritten on save.

### `ContactSubmission`

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | |
| name | string | |
| email | string | |
| lookingFor | string | one of CONTACT.needs |
| message | text | |
| read | bool | default false |
| repliedAt | DateTime? | |
| createdAt | timestamp | |

Public form action saves row, fires Resend notification to admin email. Admin inbox lists newest first, marks read on open.

---

## Directory Structure

Root-level layout (no `src/` — matches existing repo convention).

```
muem/
├── app/
│   ├── (portfolio)/                  # Existing public site — DO NOT TOUCH unless asked
│   │   └── (landing, /studio, /residences, /habitus, /contact)
│   ├── (admin)/
│   │   ├── layout.tsx                # Imports admin.css + resets bg/cursor for admin
│   │   ├── admin.css                 # Tailwind 4 entrypoint — admin only
│   │   └── admin/
│   │       ├── page.tsx              # Stub — redirects to /admin/dashboard
│   │       ├── login/                # NOT YET BUILT
│   │       ├── dashboard/            # NOT YET BUILT (placeholder dir exists)
│   │       ├── projects/             # NOT YET BUILT — StudioProject CRUD
│   │       ├── properties/           # NOT YET BUILT — Property CRUD
│   │       ├── furniture/            # NOT YET BUILT — Furniture CRUD
│   │       ├── featured/             # NOT YET BUILT — FeaturedSlot manager
│   │       └── inbox/                # NOT YET BUILT — ContactSubmission list
│   ├── api/
│   │   ├── auth/[...nextauth]/       # Auth.js v5 catch-all handler
│   │   ├── upload/image/             # NOT YET BUILT — image upload → Supabase Storage
│   │   ├── revalidate/               # Existing — keep
│   │   └── contact/                  # NOT YET BUILT — POST contact form (public)
│   └── layout.tsx                    # Root layout — imports styles/global.css
├── prisma/
│   ├── schema.prisma                 # Data model
│   ├── seed.ts                       # Seeds single ADMIN user
│   └── migrations/                   # Created on first `prisma migrate dev`
├── components/                       # PUBLIC site components (CSS Modules) — existing
│   ├── ui/                           # NOT YET BUILT — shadcn primitives target dir
│   └── admin/                        # NOT YET BUILT — admin components (Tailwind)
├── content/                          # PUBLIC hardcoded content — leave intact for now
├── lib/
│   ├── prisma.ts                     # Prisma singleton
│   ├── auth.ts                       # Auth.js v5 config
│   ├── permissions.ts                # requireAdmin helper
│   ├── utils.ts                      # cn() helper
│   ├── storage.ts                    # NOT YET BUILT — Supabase Storage helpers
│   ├── email.ts                      # NOT YET BUILT — Resend client + templates
│   ├── animation.ts                  # Existing public-site helpers
│   └── lenis.ts                      # Existing public-site helpers
├── server/
│   ├── actions/                      # NOT YET BUILT — server actions per feature
│   └── queries/                      # NOT YET BUILT — read-side RSC helpers
├── store/                            # Existing — Zustand store (ui.ts)
├── styles/                           # Existing — global.css + fonts.css
├── types/
│   └── next-auth.d.ts                # Auth.js type augmentation
├── public/
├── middleware.ts                     # Auth redirect for /admin/*
├── postcss.config.mjs                # @tailwindcss/postcss
├── components.json                   # shadcn/ui config
├── .env.local                        # Real secrets — gitignored
├── .env.example                      # Template
├── CLAUDE.md                         # This file
└── README.md
```

---

## API Design Rules

**Use Server Actions** for everything except:
- Image uploads → `POST /api/upload/image` (multipart body, Sharp resize, returns Storage path)
- Public contact form → `POST /api/contact` (rate-limited; called from public CSS-module form, not RSC)
- Cache revalidation hooks → `/api/revalidate` (existing)

Route Handlers live in `app/api/`.

---

## Server Action Pattern

Every action follows this exact pattern:

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

const inputSchema = z.object({ /* ... */ });

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function exampleAction(
  raw: z.infer<typeof inputSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { ok: false, error: "UNAUTHORIZED" };
  requireAdmin(session.user.role);

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "VALIDATION_FAILED",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await prisma.studioProject.create({ data: parsed.data });
    revalidatePath("/admin/projects");
    revalidatePath("/studio");
    return { ok: true, data: { id: result.id } };
  } catch (e) {
    console.error("[exampleAction]", e);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}
```

Never throw to client. Always return discriminated union. Always revalidate the public route that consumes the data.

---

## File Storage Rules

Single Supabase bucket: `media`. Public read, admin write only.

| Path prefix | Contents |
|-------------|----------|
| `media/projects/{id}/...` | StudioProject images |
| `media/properties/{id}/...` | Property images |
| `media/furniture/{id}/...` | Furniture images |

- Upload via `/api/upload/image` — Sharp pipeline: strip EXIF, convert to WebP, generate 3 sizes (`-sm`, `-md`, `-lg`).
- Store the **base path** in DB (`projects/{id}/cover.webp`); compose the public URL on read with `getPublicUrl()`.
- **Never** write directly to `public/images/` from the CMS — that's reserved for static brand assets only.
- Delete images on entity hard-delete; soft-delete leaves images in place.

---

## Database Conventions

- Every model: `id` (CUID), `createdAt`, `updatedAt`
- Soft-delete with `deletedAt DateTime?` for content entities (StudioProject, Property, Furniture)
- Hard-delete OK for: ContactSubmission (after explicit admin action), FeaturedSlot
- Enums for all closed value sets — no magic strings (Category, Topology, Status)
- All FK `onDelete: Restrict` by default — change explicitly when cascade needed
- `images` stored as `String[]` (Postgres array of storage paths)
- `publishedAt: DateTime?` — null = draft, set = visible on public site

---

## TypeScript Conventions

- `strict: true` — no `any` without comment justification
- `type` over `interface` except class-like contracts
- `import type { ... }` for type-only imports
- IDs: `string` (CUIDs) — never `number`
- Model types from Prisma via `@/lib/prisma` — not re-declared

---

## React Conventions

### Public site (existing)
- Client components by default (GSAP + Lenis require it)
- CSS Modules per component (`Component.module.css`)
- Do not migrate to Tailwind / shadcn

### Admin panel (new)
- **Server Components by default.** `"use client"` only for: state, effects, browser APIs, interactive event handlers
- Forms: React Hook Form + Zod resolver + Server Action handler
- Loading: `loading.tsx` per route segment + `<Suspense>` boundaries
- Client mutations: `useTransition` for pending state
- Errors: `error.tsx` per segment; `notFound()` for 404
- shadcn primitives only — install via `pnpm dlx shadcn@latest add <component>`

---

## File & Symbol Naming

- Files: `kebab-case` (`project-form.tsx`, `create-project.ts`)
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/interfaces/enums: `PascalCase`
- Routes: `kebab-case` (`/admin/featured`)

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
import { projectSchema } from "./schemas";

// 4. Type-only (bottom of each section)
import type { StudioProject } from "@prisma/client";
```

---

## Mobile-First Rules

- **Public site**: already responsive — clamp() everywhere, mobile breakpoint `max-width: 768px`. Don't break it.
- **Admin panel**: desktop-first (768px+ minimum). Functional but not optimised on mobile.

---

## Common Commands

```bash
# Dev
npm run dev                  # Next.js dev (Turbopack)

# Database
npx prisma generate          # Regenerate Prisma client
npx prisma migrate dev       # Create + apply migration (dev)
npx prisma migrate deploy    # Apply pending migrations (prod)
npx prisma studio            # Prisma GUI
npx tsx prisma/seed.ts       # Seed admin user

# Build
npm run build                # Production build
npx tsc --noEmit             # Typecheck

# shadcn
npx shadcn@latest add <component>
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=                # Supabase Postgres connection (pooler URL)
DIRECT_URL=                  # Supabase Postgres direct (for migrations)

# Auth.js
AUTH_SECRET=                 # Random 32+ char secret
AUTH_URL=                    # https://muem.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Server-side only — never NEXT_PUBLIC_

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=           # hello@muem.com
ADMIN_NOTIFY_EMAIL=          # Where contact submissions go

# Admin seed (used once by prisma/seed.ts)
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

# App
NEXT_PUBLIC_BASE_URL=        # https://muem.com
```

---

## Workflow Rules

### Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building

### Subagent Strategy
- Use Explore agents liberally for codebase research
- Offload parallel analysis to keep main context clean
- One focused task per subagent

### Verification Before Done
- Never mark a task complete without proving it works
- Run `npx tsc --noEmit` and `next build` (or at least `next dev` warnings) before "done"
- Diff behavior between main and your changes when relevant

### Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip for typo / single-line / obvious fixes
- Challenge your own work before presenting

### Self-Improvement
- After ANY user correction: append the pattern to `tasks/lessons.md`
- Review lessons at session start

---

## DO ✅

- Server Components and Server Actions wherever possible (admin only)
- Validate every input with Zod before touching DB
- Check session at every action/route boundary
- `revalidatePath()` after every mutation that affects cached pages — both `/admin/...` and the public route
- Soft-delete content entities (StudioProject, Property, Furniture)
- Add `loading.tsx` next to every new admin `page.tsx`
- Run `npx tsc --noEmit` before marking any feature done
- Keep public-site components (`components/`, `content/`) untouched unless explicitly asked

---

## DON'T ❌

- Don't expose raw Supabase Storage credentials to client
- Don't skip auth checks ("I'll add it later")
- Don't use `any` without comment
- Don't add Tailwind classes to public-site components
- Don't add `useEffect` for data fetching in admin — use RSC or TanStack Query
- Don't use `<form action="...">` with raw URLs — Server Actions only
- Don't put secrets in `NEXT_PUBLIC_*` variables
- Don't introduce new dependencies without justification
- Don't break the existing public site while building CMS — they coexist
- Don't reintroduce Sanity packages (`sanity`, `next-sanity`, `@sanity/image-url`) — being removed

---

## When Unsure

1. Check `prisma/schema.prisma` for the data model
2. Check `lib/permissions.ts` for auth logic
3. Check an analogous existing CMS feature for patterns
4. Check the existing `content/*.ts` files for the field shape the public site expects
5. If still ambiguous — ask. Don't guess on architecture.
