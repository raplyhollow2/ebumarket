# Production system map

**Generated from repo inventory.** Paths are absolute from repo root.  
**Auth legend:** `public` · `soft` (UI gate / AuthSheet) · `hard` (redirect if anon) · `admin` · `approver` (`role=admin` OR `can_approve`) · `cms` (`requireCmsAccess`)

---

## 1. Middleware

| File | Behavior |
| --- | --- |
| `src/middleware.ts` | Calls `updateSession(request)` only |
| `src/lib/supabase/middleware.ts` | SSR Supabase client; `auth.getUser()`; cookie refresh |

**Matcher:** all paths except `_next/static`, `_next/image`, `favicon.ico`, common image extensions.

**Does NOT:** redirect unauthenticated users, protect `/admin`, protect APIs.

---

## 2. App Router — pages

**Root layout:** `src/app/layout.tsx` (fonts, Toaster). No nested route layouts.

| Route | File | Auth | DB reads | DB writes (via children) |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | public | `listings` (+photos, profiles) | — |
| `/market` | `src/app/market/page.tsx` | public | `listings` | — |
| `/market/new` | `src/app/market/new/page.tsx` | **hard** → `/market` | — | `listings`, `listing_photos`, storage `listing-photos` |
| `/market/[id]` | `src/app/market/[id]/page.tsx` | public | `listings`, `meetup_points`, `profiles`, `app_config` | via BuySheet → `/api/checkout` |
| `/donate` | `src/app/donate/page.tsx` | public | `listings`, `donation_centers`, `donor_stats`, `profiles` | — |
| `/donate/new` | `src/app/donate/new/page.tsx` | **hard** → `/donate` | `donation_centers` | `listings` (+optional `center_id`), photos |
| `/donate/[id]` | `src/app/donate/[id]/page.tsx` | public | `listings` + join `donation_centers`, `profiles` | `donation_claims` via ClaimSheet |
| `/donate/centers` | `src/app/donate/centers/page.tsx` | public | `donation_centers` | — |
| `/donate/centers/[id]` | `src/app/donate/centers/[id]/page.tsx` | public | `donation_centers`, `listings` where `center_id` | — |
| `/profile` | `src/app/profile/page.tsx` | **soft** | `profiles`, `meetup_points`, `profile_themes`, `donor_stats` | same tables via clients |
| `/profile/[id]` | `src/app/profile/[id]/page.tsx` | public | `profiles`, `profile_themes`, `donor_stats`, `listings` | — |
| `/activity` | `src/app/activity/page.tsx` | **soft** | `listings`, `transactions`, `donation_claims` | claim/tx status updates |
| `/admin` | `src/app/admin/page.tsx` | **approver** | `listings` pending | verify/reject |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | **approver** | via `/api/admin/dashboard-stats` | — |
| `/admin/cms` | `src/app/admin/cms/page.tsx` | **cms** (client/API) | CMS APIs | CMS APIs |
| `/admin/experiments` | `src/app/admin/experiments/page.tsx` | **cms** | `ab_experiments` | same |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | **admin** | `profiles`, `app_config` | same |
| `/admin/transactions` | `src/app/admin/transactions/page.tsx` | **approver** | `transactions` | payout mark |
| `/admin/analytics` | `src/app/admin/analytics/page.tsx` | **admin** | `/api/analytics/admin-overview` | — |
| `/admin/centers` | `src/app/admin/centers/page.tsx` | **admin** | `donation_centers`, `center_members`, `profiles` | create/update centres, members |

---

## 3. API routes

| Path | Methods | Auth | Tables / notes |
| --- | --- | --- | --- |
| `/api/auth/confirm` | POST | **none** (uses `DATABASE_URL`) | `auth.users` — MVP email confirm |
| `/api/checkout` | POST | user | `listings`, `transactions` + Stripe |
| `/api/webhooks/stripe` | POST | Stripe sig | `transactions` |
| `/api/cms/active-hero` | GET | optional | `cms_hero_sections` |
| `/api/preferences` | GET, PUT | user | `user_preferences` |
| `/api/recommendations` | GET | user | prefs, `social_interactions`, `listings` |
| `/api/experiments/expose` | POST | optional | `ab_experiments`, `ab_exposure_events` |
| `/api/experiments/convert` | POST | optional | `ab_conversion_events` |
| `/api/admin/cms/hero-sections` | GET, POST | cms | `cms_hero_sections`, audit |
| `/api/admin/cms/hero-sections/[id]` | PATCH, DELETE | cms | same |
| `/api/admin/cms/content-blocks` | GET, POST | mixed | `cms_content_blocks` |
| `/api/admin/experiments` | GET, POST, PATCH | cms | `ab_experiments` |
| `/api/admin/dashboard-stats` | GET | **none today** ⚠️ | aggregate KPIs |
| `/api/admin/roles` | GET, POST | RBAC | `admin_roles` |
| `/api/admin/role-assignments` | GET, POST | RBAC | assignments |
| `/api/admin/my-role` | GET | user | role assignment |
| `/api/analytics/admin-overview` | GET | approver | listings/profiles/tx/events |
| `/api/analytics/seller-stats` | GET | user | seller metrics |
| `/api/analytics/listing-stats` | GET | user | listing metrics |
| `/api/analytics/audience` | GET | user | + some mock hour buckets |
| `/api/social/likes` | GET, POST, DELETE | user | `social_interactions` |
| `/api/social/follows` | GET, POST, DELETE | user | `social_interactions` |
| `/api/social/comments` | GET, POST, PATCH, DELETE | GET public | `comments` |
| `/api/messaging/conversations` | GET, POST | user | `conversations` |
| `/api/messaging/messages` | GET, POST, PATCH, PUT | user | `messages` |
| `/api/offers` | GET, POST, PATCH | user | `offers` |
| `/api/boost` | GET, POST | mixed | `boosted_listings` |
| `/api/ai/generate-description` | POST | user | mock/AI |
| `/api/ai/enhance-photo` | POST | user | mock |

**No dedicated REST for** `donation_centers` / `center_members` / `donor_stats` / `profile_themes` — pages use **Supabase client** + RLS.

---

## 4. Auth helpers

| Helper | File | Returns |
| --- | --- | --- |
| `getViewerAccess()` | `src/lib/settings.ts` | `{ user, profile, isAdmin, canApprove }` |
| `createClient()` server | `src/lib/supabase/server.ts` | SSR client |
| `createClient()` browser | `src/lib/supabase/client.ts` | browser client |
| `RequireAuthLink` | `src/components/auth/require-auth-link.tsx` | soft gate → AuthSheet |
| `AdminLoginGate` | `src/app/admin/admin-login-gate.tsx` | admin login UI |

---

## 5. Shells / navigation

| Shell | File | Used by |
| --- | --- | --- |
| `ResponsiveLayoutWrapper` | `src/components/layout/ResponsiveLayoutWrapper.tsx` | Most teen pages (renders **TeenShell + DesktopShell** both) |
| `TeenShell` + `bottom-nav` | mobile | Home / Market / Donate / Activity / Profile |
| `DesktopShell` + `DesktopHeader` | desktop | same |
| `HomeShell` | full-bleed home | `/` only |
| `AdminShell` | `src/components/admin/AdminShell.tsx` | all `/admin/*` |

**Bottom nav targets:** `/`, `/market`, `/donate`, `/activity`, `/profile`

---

## 6. LIVE vs DEAD frontend (donation / profile)

### LIVE (imported by pages)

- `src/components/donations/CenterCard.tsx`
- `src/components/donations/DonorBadge.tsx`
- `src/components/profile/ProfileThemeEditor.tsx`
- `src/components/listings/listing-composer.tsx` (`center_id`)
- `src/components/listings/donate-detail-client.tsx`
- `src/components/listings/claim-sheet.tsx`
- `src/lib/donor-tiers.ts`
- `src/app/profile/profile-client.tsx`

### DEAD / MOCK (do not ship in routes)

- `src/components/donations/OrganizationProfile.tsx`
- `src/components/donations/DonationStories.tsx`
- `src/components/donations/DonationImpact.tsx`

APIs exist without pages for messaging / social / boost / much of analytics — treat as **Phase 2+ product surface**, not donation-domain blockers.
