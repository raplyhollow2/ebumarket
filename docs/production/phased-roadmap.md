# Phased implementation roadmap

Production work after v1 centres/tiers/themes ship.  
**Do not estimate calendar time** — phases are technical slices.

---

## Phase 0 — Documentation (done)

- [x] `docs/production/00-index.md`
- [x] `docs/production/system-map.md`
- [x] `docs/production/schema-reference.md`
- [x] `docs/production/donation-domain.md`
- [x] This roadmap
- [x] Index from `docs/README.md`

---

## Phase 1 — Close production gaps (implement now)

**Goal:** Admin can run centres; seed is reproducible; staff membership exists; docs match code.

| # | Work | Touch points | Status |
| --- | --- | --- | --- |
| 1.1 | `/admin/centers` list/create/edit verify+active | `src/app/admin/centers/*`, `AdminShell` nav | Done |
| 1.2 | Assign `center_members` (owner/staff) from admin | same page; table `center_members` | Done |
| 1.3 | Seed: `center_id` on donations, members, sample theme, `recompute_donor_stats` | `scripts/seed.ts` | Done |
| 1.4 | Centre detail: public query `status=verified` only (match RLS) | `donate/centers/[id]/page.tsx` | Done |
| 1.5 | Centre page: if viewer is member, show staff banner | same | Done |
| 1.6 | Deprecate mock donation components (file header) | OrganizationProfile, DonationStories, DonationImpact | Done |
| 1.7 | Harden `/api/admin/dashboard-stats` with `getViewerAccess` | API route | Done |
| 1.8 | After admin verifies donation: toast mentions points | AdminQueueClient | Done |

**Exit:** Admin can add a centre and staff; `npm run seed` tags donations; build green; production docs accurate.

---

## Phase 2 — Staff ops + polish

| # | Work |
| --- | --- |
| 2.1 | Activity tab: “Centre inbox” for `center_members` (claims on tagged listings) |
| 2.2 | Optional RLS: centre members SELECT tagged listings including pending claims context |
| 2.3 | Profile banner/avatar upload to Supabase Storage bucket `profile-media` (+ `center-media`) | **Done** (Phase 1.5) |
| 2.4 | Top-donors / tier toast on donor verify path (non-admin) |
| 2.5 | Remove dead mock components from repo |
| 2.6 | Wire orphaned social/messaging pages OR document as deferred APIs-only |

---

## Phase 3 — Product expansions (client “next”)

| # | Work |
| --- | --- |
| 3.1 | Money donations to centres (payments model TBD) |
| 3.2 | Centre self-signup + KYC + admin approve queue |
| 3.3 | Tumblr-like posts / scrapbook on public profile |
| 3.4 | Push / email on tier-up |
| 3.5 | Public leaderboard page |

---

## Phase 4 — Hardening

| # | Work |
| --- | --- |
| 4.1 | Auth on all admin APIs; rate limits |
| 4.2 | Image URL allowlist / XSS on theme URLs |
| 4.3 | Observability on `recompute_donor_stats` |
| 4.4 | E2E: centre donate → verify → points → theme |

---

## Current phase pointer

**Active:** Phase 1 complete → next **Phase 2**  
**Branch:** `cursor/remaining-phase-134f`  
**PR:** #8
