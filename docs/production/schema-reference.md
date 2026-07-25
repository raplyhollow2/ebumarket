# Production schema reference

**Project:** Supabase `ynnmfnoxxwtpiiwrnpup`  
**Apply:** run SQL migrations in filename order against live Postgres (`DATABASE_URL`).

---

## 1. Migration order

| # | File |
| --- | --- |
| 1 | `supabase/migrations/20260721170000_zyra_schema.sql` |
| 2 | `supabase/migrations/20260721170100_zyra_rls.sql` |
| 3 | `supabase/migrations/20260721170200_profiles_public_read.sql` |
| 4 | `supabase/migrations/20260721184000_btn_and_approvers.sql` |
| 5 | `supabase/migrations/20260721195000_split_payment_payouts.sql` |
| 6 | `supabase/migrations/20260724_depop_features.sql` |
| 7 | `supabase/migrations/20260724_depop_rls.sql` |
| 8 | `supabase/migrations/20260725_admin_erp_cms.sql` |
| 9 | `supabase/migrations/20260725_rbac_cms_system.sql` |
| 10 | `supabase/migrations/20260725_phase3_cms_access.sql` |
| 11 | `supabase/migrations/20260725140000_donation_centers_profiles.sql` |

---

## 2. Core commerce tables (summary)

### `profiles`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | = `auth.users.id` |
| `display_name` | text | |
| `role` | text | `user` \| `admin` |
| `is_organization` | bool | legacy org flag (centres are separate table) |
| `area` | text | |
| `preferred_payment` | text? | |
| `can_approve` | bool | listing approvers |
| `bio`, `avatar_url`, counters | optional Depop cols | Prefer **`profile_themes`** for public page look |

**RLS:** public SELECT; update own / admin.

### `listings`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `seller_id` | uuid → profiles | |
| `type` | text | `marketplace` \| `donation` |
| `title`, `description`, `category`, `size`, `condition` | text | |
| `price_cents` | int? | null for donations |
| `currency` | text | default BTN |
| `status` | text | `draft\|pending\|verified\|rejected\|sold\|claimed\|closed` |
| `center_id` | uuid? → `donation_centers` | **donation destination** |
| verify fields | | `reject_reason`, `verified_at`, `verified_by` |

**RLS SELECT (effective):** `status = 'verified'` OR seller OR admin OR `can_approve`.  
⚠️ **`claimed` is NOT public** — anon cannot read claimed rows. Center pages must query `verified` for public visitors.

### `listing_photos`
`listing_id`, `angle` (`front|back|tag|defect|other`), `storage_path`, `public_url`, `sort_order`

### `donation_claims`
`listing_id`, `claimer_id`, `message`, `contact`, `pickup_preference`, `status` (`requested|approved|fulfilled|declined`)

### `transactions`
Marketplace purchases + Stripe + payout columns (`seller_payout_cents`, `payout_status`, …)

### `meetup_points`
`user_id`, `label`, `notes?`

### `app_config`
key/value jsonb (`currency`, `platform_fee_percent`)

---

## 3. Donation domain (migration `20260725140000`)

### `donation_centers`
| Column | Type | Constraints |
| --- | --- | --- |
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `center_type` | text | `orphanage\|community_center\|cso\|shelter\|other` |
| `slug` | text UNIQUE | |
| `tagline`, `description`, `area` | text | |
| `contact_email`, `contact_phone`, `website` | text? | |
| `cover_url`, `logo_url` | text? | |
| `needs` | text[] | default `{}` |
| `is_verified` | bool | default false |
| `is_active` | bool | default true |
| `created_by` | uuid? → profiles | |
| timestamps | | |

**RLS**
- SELECT: `is_active = true` (public)
- ALL: `profiles.role = 'admin'`

**Seeded rows (slug):** `thimphu-childrens-home`, `paro-youth-centre`, `phuentsholing-shelter-hub`, `bhutan-youth-cso`

### `center_members`
| Column | Type |
| --- | --- |
| `id` | uuid PK |
| `center_id` | uuid → donation_centers CASCADE |
| `user_id` | uuid → profiles CASCADE |
| `member_role` | `owner` \| `staff` |
| UNIQUE | `(center_id, user_id)` |

**RLS:** SELECT own membership or admin; ALL admin.

### `donor_stats`
| Column | Type |
| --- | --- |
| `user_id` | uuid PK → profiles |
| `points` | int | |
| `items_donated` | int | verified+claimed+closed donations |
| `items_fulfilled` | int | status = claimed |
| `center_donations` | int | donations with `center_id` set |
| `tier` | `seedling\|helper\|guardian\|champion` |

**Formula** (fn `recompute_donor_stats`):  
`points = items_donated*10 + items_fulfilled*15 + center_donations*5`  
Tier thresholds: 0 / 25 / 75 / 150.

**Trigger:** `listings_donor_stats_trg` AFTER INSERT/UPDATE OF status,type,center_id,seller_id / DELETE.

**RLS:** public SELECT; writes via SECURITY DEFINER only.

### `profile_themes`
| Column | Type |
| --- | --- |
| `user_id` | uuid PK |
| `banner_url`, `avatar_url` | text? |
| `bio` | text | |
| `accent_color` | text default `#1c3024` |
| `background_style` | `plain\|soft_wash\|grid_dots\|photo_blur` |
| `layout_style` | `classic\|stacked\|magazine` |
| `show_donation_stats` | bool | |
| `show_listings` | bool | |
| `custom_links` | jsonb array `{label,url}` max 5 in UI |

**RLS:** owner ALL; public SELECT.

---

## 4. Storage

| Bucket | Public | Path convention | Used for |
| --- | --- | --- | --- |
| `listing-photos` | yes | `{userId}/{listingId}/{angle}-{ts}` | Listing composer (Market + Donate) |
| `profile-media` | yes | `{userId}/banner-{ts}.{ext}`, `{userId}/avatar-…` | Profile theme banner + avatar uploads |
| `center-media` | yes | `{centerId\|covers}/cover-{ts}.{ext}` | Admin centre cover uploads |

**UI:** `src/components/ui/ImageUploadField.tsx` + `src/lib/storage-upload.ts`  
**DB columns store `public_url`** (`profile_themes.banner_url` / `avatar_url`, `donation_centers.cover_url`, `listing_photos.public_url`).

Seed may still use external Unsplash URLs for demo rows; **user/admin uploads always go to Storage**.

Migration: `supabase/migrations/20260725150000_profile_center_media_storage.sql`

---

## 5. Env (production)

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + SSR |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key |
| `DATABASE_URL` | Migrations, seed, `/api/auth/confirm`, Stripe webhook pg |
| Stripe keys | Checkout + webhook |
| `PLATFORM_FEE_PERCENT` | Fallback fee |
