# Data Model — Live Supabase

PostgreSQL on Supabase is the only source of truth. Schema is applied via `supabase/migrations`.

## Live-data rules

| Rule | Detail |
| --- | --- |
| Source of truth | Supabase Postgres tables |
| Forbidden | localStorage / IndexedDB / client JSON as DB |
| Writes | Server Actions / Route Handlers → Supabase |
| Cache | React state / Next cache only; must revalidate from DB |
| Images | Supabase Storage + `listing_photos` rows |
| Auth | Supabase Auth `auth.users` + `profiles` |
| Payments | Stripe test mode; statuses written to `transactions` |

## Entities

### `profiles`

Extends `auth.users` (1:1 on `id`).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | = `auth.users.id` |
| `display_name` | text | |
| `role` | text | `user` \| `admin` |
| `is_organization` | boolean | default false |
| `area` | text | city / neighborhood |
| `preferred_payment` | text? | `cod` \| `online` |
| `created_at` | timestamptz | |

### `meetup_points`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `label` | text | e.g. “Mall food court” |
| `notes` | text? | |
| `created_at` | timestamptz | |

### `listings`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `seller_id` | uuid FK → profiles | |
| `type` | text | `marketplace` \| `donation` |
| `title` | text | |
| `description` | text | |
| `category` | text | |
| `size` | text | |
| `condition` | text | |
| `price_cents` | int? | null for donations |
| `currency` | text | default `USD` (or project currency) |
| `status` | text | see enums |
| `reject_reason` | text? | |
| `verified_at` | timestamptz? | |
| `verified_by` | uuid? | admin profile |
| `created_at` / `updated_at` | timestamptz | |

**Status enum:** `draft` \| `pending` \| `verified` \| `rejected` \| `sold` \| `claimed` \| `closed`

Index: `(status)` for admin queue (`pending`); `(type, status)` for market/donate browse.

### `listing_photos`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `listing_id` | uuid FK | |
| `angle` | text | `front` \| `back` \| `tag` \| `defect` \| `other` |
| `storage_path` | text | Supabase Storage path |
| `public_url` | text | |
| `sort_order` | int | |
| `created_at` | timestamptz | |

Marketplace submit requires angles: front, back, tag, defect (+ optional other).

### `transactions`

Marketplace purchases only. **Buyer pays platform; platform keeps `fee_cents`; seller share is `seller_payout_cents`.**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `listing_id` | uuid FK | |
| `buyer_id` / `seller_id` | uuid FK | buy requests always include listing seller |
| `payment_method` | text | `cod` \| `online` |
| `meetup_point_id` | uuid? | required for COD |
| `item_price_cents` | int | listing price (= seller share when fee is additive) |
| `fee_cents` | int | platform keep (default 5% of item) |
| `total_cents` | int | amount buyer pays platform (`item + fee`) |
| `seller_payout_cents` | int | amount platform delivers to seller |
| `payout_status` | text | see below |
| `payout_claimed_at` | timestamptz? | when seller claimed |
| `payout_paid_at` | timestamptz? | when platform marked paid out |
| `status` | text | see below |
| `stripe_checkout_session_id` | text? | |
| `stripe_payment_intent_id` | text? | |
| `created_at` / `updated_at` | timestamptz | |

**Status:** `requested` \| `awaiting_payment` \| `paid` \| `accepted` \| `completed` \| `cancelled`

**Payout status:** `pending` \| `claimable` \| `claimed` \| `paid_out` \| `not_applicable`

### `donation_claims`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `listing_id` | uuid FK | |
| `claimer_id` | uuid FK | |
| `message` | text | |
| `contact` | text | |
| `pickup_preference` | text | |
| `status` | text | `requested` \| `approved` \| `fulfilled` \| `declined` |
| `created_at` | timestamptz | |

### `audit_events`

Admin / system trail (verify, reject, payment webhook).

| Column | Type |
| --- | --- |
| `id` | uuid PK |
| `actor_id` | uuid? |
| `action` | text |
| `entity_type` / `entity_id` | text / uuid |
| `payload` | jsonb |
| `created_at` | timestamptz |

### `app_config` (optional)

| Column | Type | Notes |
| --- | --- | --- |
| `key` | text PK | e.g. `platform_fee_percent` |
| `value` | jsonb | |

## Storage buckets

| Bucket | Purpose | Access |
| --- | --- | --- |
| `listing-photos` | Listing images | Authenticated upload; public or signed read for verified listings |

## RLS sketch

| Table | Policy intent |
| --- | --- |
| `profiles` | Users read/update own; admins read all |
| `meetup_points` | Owner CRUD |
| `listings` | Public **select** where `status = verified` (and not sold/closed); owner select all own; insert/update own; admin update any |
| `listing_photos` | Same visibility as parent listing |
| `transactions` | Buyer or seller select own; buyer insert; parties/admin update status |
| `donation_claims` | Claimer + listing owner select; claimer insert; owner/admin update |
| `audit_events` | Admin read; server insert |

Exact SQL lives in migrations during implementation.

## Seed personas → rows

| Persona | Role flags |
| --- | --- |
| Maya | `user`, seller seed listings |
| Jordan | `user`, buyer |
| Sam | `user`, donor listings |
| Alex | `admin` |
| Rivera Closet | `user` + `is_organization = true` |

## Edge cases (must handle in app)

- Reject → seller edits → resubmit → `pending` again
- Two buyers race on same item → first successful transaction wins; listing → `sold`
- Donation: multiple claims allowed until donor approves one; then listing → `claimed`
- COD without meetup point → inline quick-add before confirm
- Stripe webhook idempotency via session/payment intent ids
