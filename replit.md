# Elite Estates

A high-end Luxury Noir real estate portal for Pune builders — featuring a cinematic public interface and a protected owner admin dashboard.

## Run & Operate

- `pnpm --filter @workspace/luxury-realestate run dev` — frontend (port 19788, preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080, at `/api`)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to Replit PostgreSQL
- Required env: `DATABASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18, Vite, Tailwind CSS, Framer Motion, Wouter (routing)
- API: Express 5, Drizzle ORM, PostgreSQL (Replit-managed)
- Auth: Supabase Auth (client-side, admin only)
- API codegen: Orval (OpenAPI → React Query hooks + Zod schemas)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (`properties.ts`, `settings.ts`)
- `artifacts/luxury-realestate/src/pages/` — Home, Properties, Login, Admin
- `artifacts/luxury-realestate/src/lib/supabase.ts` — Supabase client (guarded)
- `artifacts/api-server/src/routes/` — properties.ts, settings.ts, health.ts

## Architecture decisions

- Properties and settings are stored in Replit's PostgreSQL (via Drizzle), NOT Supabase DB
- Supabase is used ONLY for admin authentication (signInWithPassword)
- The Supabase client is lazily initialized and gracefully degrades to demo mode if env vars are missing or invalid
- Codegen script patches `lib/api-zod/src/index.ts` post-orval to avoid duplicate export conflicts
- Admin route is client-side guarded via `supabase.auth.getUser()` on mount

## Product

- **Public:** Cinematic hero with WhatsApp CTA, scrolling special-offer marquee banner, featured property gallery (live from DB), amenities section with gold icons
- **Properties page:** Full gallery with available/sold-out filters
- **Admin (/login + /admin):** Protected dashboard — edit prices, toggle sold-out status, update image URLs, add/delete properties, update homepage marquee text, view stats

## User preferences

- Luxury Noir theme: #000000 background, #D4AF37 gold, white typography
- Site name: samplewebsite.replit.app / Elite Estates
- WhatsApp link: https://wa.me/919999999999 (update to real number before launch)
- Target audience: Pune luxury real estate builders

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after every OpenAPI spec change
- The codegen script echoes a fixed `index.ts` to avoid orval's duplicate barrel exports
- Supabase URL must be a valid https:// URL or the client silently degrades to demo mode
- To create an admin user: use Supabase dashboard → Authentication → Add user
- `pnpm --filter @workspace/db run push` must be run after schema changes

## Pointers

- See `lib/api-spec/openapi.yaml` for all endpoint definitions
- See `.local/skills/pnpm-workspace/` for workspace conventions
