# Zyra

Teen-focused **circular fashion** platform: Peer-to-Peer Marketplace + Donation Hub, with admin verification for trust.

## Stack

- **Next.js** (App Router) + TypeScript + **shadcn/ui**
- **Supabase** (Postgres + Auth + Storage + RLS) — all live data
- **Stripe test mode** for online pay (optional; COD works without Stripe keys)

## Docs first

Product / drawing board (source of truth for intent):

- [docs/README.md](./docs/README.md)
- [docs/drawing-board/00-index.md](./docs/drawing-board/00-index.md)
- [docs/product/tech-sketch.md](./docs/product/tech-sketch.md)

## Setup

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, DATABASE_URL

npm install
npm run db:migrate   # applies supabase/migrations via DATABASE_URL
npm run seed         # demo personas + listings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Persona | Email | Password |
| --- | --- | --- |
| Maya (seller) | maya@example.com | zyra-demo-maya |
| Jordan (buyer) | jordan@example.com | zyra-demo-jordan |
| Sam (donor) | sam@example.com | zyra-demo-sam |
| Alex (admin) | alex@example.com | zyra-demo-alex |

Admin queue: `/admin`

## Env notes

- Prefer the **Supabase pooler** connection string if `db.*.supabase.co` is IPv6-only in your network.
- Never commit `.env.local` or real secrets.
- Stripe keys are optional for COD-only usability tests.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run seed` | Seed live demo users/listings |
