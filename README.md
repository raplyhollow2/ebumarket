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

## Deploy (Vercel + GitHub)

1. Push / merge to **`main`** (already has the full app).
2. In Vercel: import this GitHub repo, Framework = **Next.js**, Root = repo root.
3. Add env vars (Project → Settings → Environment Variables):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ynnmfnoxxwtpiiwrnpup.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_mYKsqiMZ3Hw9iLzAPADugw_AuDJXuru
DATABASE_URL=postgresql://postgres.ynnmfnoxxwtpiiwrnpup:S7dIspYllOKZzZZW@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
PLATFORM_FEE_PERCENT=5
```

4. Deploy. Production URL on a team is usually:
   `https://ebumarket-raplyhollow2s-projects.vercel.app`  
   Add `ebumarket.vercel.app` under **Settings → Domains** if you want that name.
5. Turn **Deployment Protection** off for Production so the site is public.

## Local setup

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
