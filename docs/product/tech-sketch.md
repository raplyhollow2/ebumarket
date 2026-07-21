# Tech Sketch — Committed Stack

This is the **implementation source of truth** for Zyra’s MVP. Not a soft proposal.

## Stack

| Layer | Choice |
| --- | --- |
| App | **Next.js (App Router) + TypeScript** |
| UI | **Tailwind CSS + shadcn/ui** |
| Forms / validation | **React Hook Form + Zod** |
| Backend | **Supabase** (Postgres + Auth + Storage + RLS) |
| Client | **`@supabase/ssr`** |
| Schema | **Supabase CLI migrations** |
| Payments | **Stripe test mode** + webhooks → live `transactions` |
| Hosting | **Vercel** + Supabase cloud |

See also: [data-model.md](./data-model.md), [ui-system.md](./ui-system.md).

## Supabase project

| Item | Value |
| --- | --- |
| Project ref | `ynnmfnoxxwtpiiwrnpup` |
| API URL | `https://ynnmfnoxxwtpiiwrnpup.supabase.co` |

### CLI setup (implementation phase)

```bash
supabase login
supabase init
supabase link --project-ref ynnmfnoxxwtpiiwrnpup
```

Apply schema with `supabase db push` / migration workflow. Never commit secrets.

## Environment variables

Document placeholders only. Real values live in `.env.local` / deployment secrets.

```bash
# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Server only
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PLATFORM_FEE_PERCENT=5
```

See root [`.env.example`](../../.env.example).

## Live-data rules (hard)

1. **Supabase Postgres is the only source of truth.**
2. **No localStorage / in-memory / client JSON** as the app database.
3. Mutating UI always calls **Server Actions or Route Handlers** → Supabase.
4. Photos go to **Supabase Storage**; metadata rows in `listing_photos`.
5. Auth is **Supabase Auth**; profile/role rows in `profiles`.
6. Online pay uses **Stripe test mode**; webhooks update live transaction status. COD still inserts live rows.
7. Seed scripts bootstrap demo rows into Supabase; usability sessions then mutate **live** data.

## Architecture

```text
Browser (shadcn UI)
  → Server Actions / Route Handlers
      → @supabase/ssr (user session + RLS)
      → Supabase Postgres / Auth / Storage
  → Stripe Checkout (test) → webhook → transactions table
```

Service role key: server-only (seed, admin overrides, webhooks). Prefer RLS for normal user paths.

## Suggested app layout

```text
app/
  (teen)/          # home, market, donate, activity, profile
  admin/           # verification queue, transactions
  auth/            # callback, sign-in sheet targets
  api/webhooks/stripe/
components/ui/     # shadcn
lib/supabase/      # server, client, middleware helpers
supabase/migrations/
```

## Route map

```text
/                    Home (brand hero)
/market              Browse verified marketplace
/market/new          Sell composer (single screen)
/market/[id]         Detail + buy Sheet
/donate              Donation hub
/donate/new          Donate composer
/donate/[id]         Detail + claim Sheet
/activity            Unified inbox (live queries)
/profile             Profile + meetup points
/admin               Verification queue (inline actions)
/admin/transactions  Transactions DataTable
```

Auth: sheet/modal at moment of need (Sell / Buy / Claim); dedicated `/login` optional fallback.

## Seed (bootstrap only)

Via Supabase seed / SQL into the **live** project:

- Users: Maya (seller), Jordan (buyer), Sam (donor), Alex (admin)
- 6–8 verified marketplace listings
- 2–3 pending listings (admin task)
- 4 donation listings
- Meetup points for seller/buyer personas

Reset between research sessions by re-seeding, not by wiping client storage.

## Analytics (lightweight)

Persist or log events against live sessions where useful:

`view_item`, `start_sell`, `submit_listing`, `verify_listing`, `start_checkout`, `select_payment`, `confirm_purchase`, `submit_claim`

## Security

- RLS on all app tables (see [data-model.md](./data-model.md))
- No service role in the browser
- No secrets in git
- Teen safety: general area + meetup points; no home address by default
- Stripe test mode only until production readiness review
