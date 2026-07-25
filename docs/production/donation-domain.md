# Donation domain — production spec (hyper-specific)

Maps every UI surface → file → query/mutation → table → RLS.

---

## 1. End-to-end flows

### A. Browse centre → donate tagged item

```
GET /donate/centers
  → donation_centers WHERE is_active AND is_verified
GET /donate/centers/[id]
  → donation_centers by id
  → listings WHERE center_id = id AND type=donation AND status=verified
CTA → /donate/new?center=[id] (auth hard)
  → ListingComposer insert listings { type:donation, center_id, status:pending }
Admin /admin queue → status=verified
  → trigger recompute_donor_stats(seller_id)
Centre page shows item; /donate hub lists it
```

### B. Peer gift (no centre)

```
/donate/new → center_id null → claim via ClaimSheet → donation_claims
Donor Activity → approve → listing status claimed → +15 points path
```

### C. Customize profile

```
/profile → ProfileThemeEditor upsert profile_themes
/profile/[id] reads profile_themes + donor_stats + listings
```

---

## 2. Frontend inventory (connected)

| Surface | Route | Component / page file | Supabase ops |
| --- | --- | --- | --- |
| Hub | `/donate` | `src/app/donate/page.tsx` | R `listings`(+centers join), `donation_centers` limit 4, `donor_stats` top 5, `profiles` names |
| Centres directory | `/donate/centers` | `src/app/donate/centers/page.tsx` + `CenterCard` | R `donation_centers` |
| Centre detail | `/donate/centers/[id]` | `src/app/donate/centers/[id]/page.tsx` | R center + tagged **verified** listings |
| Composer | `/donate/new` | `listing-composer.tsx` | R centers; W `listings.center_id`, photos |
| Item detail | `/donate/[id]` | `donate-detail-client.tsx` | R listing+center; W `donation_claims` |
| Own profile | `/profile` | `profile-client.tsx`, `ProfileThemeEditor`, `DonorBadge` | R/W profiles, meetups, themes; R donor_stats |
| Public profile | `/profile/[id]` | page inline theme | R themes, stats, listings |
| Admin centres | `/admin/centers` | admin centers client | R/W `donation_centers`, `center_members` |
| Tier helper | — | `src/lib/donor-tiers.ts` | pure TS |
| Types | — | `src/lib/types.ts` | `DonationCenter`, `DonorStats`, `ProfileTheme`, `Listing.center_id` |

---

## 3. Field contracts

### Composer insert (`listings`)

```ts
{
  seller_id: userId,
  type: "donation" | "marketplace",
  title, description, category, size, condition,
  price_cents: number | null,
  currency: "BTN",
  status: "pending",
  center_id: string | null  // donation only; null = peer gift
}
```

### Theme upsert (`profile_themes`)

```ts
{
  user_id,
  banner_url,   // public URL from Storage bucket profile-media (upload UI)
  avatar_url,   // same
  bio,
  accent_color, background_style, layout_style,
  show_donation_stats, show_listings,
  custom_links: { label, url }[],  // UI max 5
  updated_at
}
```

Upload: `ImageUploadField` → `uploadPublicImage({ bucket: "profile-media", folder: userId, kind })` → save URL on theme.

### Centre cover (`donation_centers.cover_url`)

Admin `/admin/centers` uploads via `center-media` bucket; URL stored on row.

### Centre create (admin)

```ts
{
  name, center_type, slug, tagline, description, area,
  contact_email?, cover_url?, needs: string[],
  is_verified, is_active
}
```

---

## 4. Points & tiers (exact)

| Event | Points |
| --- | --- |
| Donation listing in `{verified,claimed,closed}` | +10 each |
| Donation `status=claimed` | +15 each (extra) |
| Same with `center_id IS NOT NULL` | +5 each (extra) |

| Tier | Min points | UI label |
| --- | --- | --- |
| seedling | 0 | Seedling |
| helper | 25 | Helper |
| guardian | 75 | Guardian |
| champion | 150 | Champion |

Rendered by `DonorBadge` (`showProgress` on own profile).

---

## 5. RLS gotchas (production)

| Situation | Behavior |
| --- | --- |
| Anon reads `status=claimed` listing | **Blocked** by listings SELECT policy |
| Centre detail asks for verified+claimed | Public only sees **verified**; claimed invisible to anon |
| `donor_stats` | Readable by anyone; no client INSERT |
| `donation_centers` inactive | Hidden from public SELECT |
| Non-admin INSERT centre | Denied — use `/admin/centers` as admin |
| `center_members` | Staff can SELECT own rows; no elevated listing read yet |

---

## 6. Known gaps (tracked)

| Gap | Phase |
| --- | --- |
| Staff special claim queue for tagged items | P1 UI (members assigned); P2 dedicated Activity filter |
| Claimed items visible on centre page to public | P2 RLS decision |
| Profile image upload to Storage | **Done** — `profile-media` / `center-media` + `ImageUploadField` |
| Post-verify toast “+10 progress” | P1 |
| `/api/admin/dashboard-stats` unauthenticated | P1 harden |
| Dead mock donation components | P1 mark deprecated / remove imports |
| Money donations to centres | P3+ out of scope |
| Centre self-signup KYC | P3+ |
| Tumblr post/blog feed | P3+ |
| Seed without `center_id` / themes / members | P1 seed fix |

See [phased-roadmap.md](./phased-roadmap.md).
