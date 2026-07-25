# Donation Centers, Donor Motivation & Custom Profiles

**Status:** Spec shipped (v1 UI + migration)  
**Audience:** Client (orphanages/centers), teen donors, admins  
**Related:** [mvp-scope.md](./mvp-scope.md), [user-flows.md](../flows/user-flows.md), [admin-erp.md](./admin-erp.md)

---

## Donation basket (multi-item)

Donors can add **multiple clothes** in one session on `/donate/new`:

1. Fill item + photos → **Add to basket**  
2. Repeat for more items (centre tag can differ per item)  
3. **Submit basket** → creates N `listings` (`type=donation`, `status=pending`)  

Marketplace sell remains single-item. Claim stays per listing (different donors/pickups).

---

## 1. Donation Centers (orphanages & centres)

### Concept

A **Donation Center** is a verified destination (orphanage, youth centre, CSO, shelter). Donors pick a center when listing free clothes. Staff/claimers at that center can request items marked for them.

### Data

| Table | Purpose |
| --- | --- |
| `donation_centers` | Center directory (name, type, area, story, contact, cover, verified) |
| `listings.center_id` | Optional FK — item earmarked for that center |
| `center_members` | Who can manage a center (profile ↔ center, role admin/staff) |

**Center types:** `orphanage` \| `community_center` \| `cso` \| `shelter` \| `other`

### Flows

```mermaid
flowchart LR
  Browse[/donate/centers] --> Pick[Select center]
  Pick --> List[/donate/new?center=id]
  List --> Pending[Pending Zyra verify]
  Pending --> Live[Live: tagged for center]
  Live --> Claim[Center staff or public claim]
  Claim --> DonorApprove[Donor approve in Activity]
```

**Donor path**

1. Browse `/donate/centers`  
2. Open a center → **Donate to this place**  
3. Composer pre-selects `center_id`; same 4 photo angles  
4. Zyra verifies → item shows on Donation Hub **and** on the center page  

**Center path**

1. Admin verifies center (or seed verified)  
2. Staff linked via `center_members`  
3. Staff claim items tagged to their center from Activity / center page  

### UX surfaces

| Route | Job |
| --- | --- |
| `/donate/centers` | Directory grid |
| `/donate/centers/[id]` | Story, needs, live items, Donate CTA |
| `/donate/new?center=` | Composer with center locked/selected |
| `/donate` | Hub: toggles Peer gifts \| Centers |

### Admin ERP

- Queue already verifies listings (including center-tagged)  
- Later: `/admin/centers` approve new centers (v1: seed + admin SQL/settings)

---

## 2. Donor motivation — ratings & tiers

### Goal

Make donating feel rewarding without money: **visible reputation**.

### Score model (simple, live)

| Action | Points |
| --- | --- |
| Donation listing verified | +10 |
| Claim approved (donor fulfilled gift) | +15 |
| Center-tagged donation verified | +5 bonus |

**Tier** (stored + derived)

| Tier | Min points | Badge |
| --- | --- | --- |
| Seedling | 0 | New donor |
| Helper | 25 | Regular giver |
| Guardian | 75 | Trusted donor |
| Champion | 150 | Community lead |

### Surfaces

- Profile: tier badge + points + “items given”  
- Public profile: same badge (motivation via social proof)  
- Donation Hub: optional “Top donors” strip (light)  
- After successful donate verify: toast “+10 · Helper progress”

### Not in v1

- Paid badges  
- Complex leaderboards with prizes  
- Negative ratings of people  

---

## 3. Tumblr-like customizable profiles

### Goal

Profiles feel like a **personal page**, not a form: banner, colors, bio, layout vibe.

### Customization fields (`profile_themes`)

| Field | Notes |
| --- | --- |
| `banner_url` | Wide cover image |
| `avatar_url` | Profile image |
| `bio` | Short about (markdown-plain text) |
| `accent_color` | Hex accent |
| `background_style` | `plain` \| `soft_wash` \| `grid_dots` \| `photo_blur` |
| `layout_style` | `classic` \| `stacked` \| `magazine` |
| `show_donation_stats` | bool |
| `show_listings` | bool |
| `custom_links` | JSON array `{label, url}` (max 5) |

### Edit UX

- `/profile` → **Customize page** panel  
- Live preview strip  
- Public `/profile/[id]` renders theme  

### Guardrails

- No arbitrary CSS/JS (safety)  
- Image URLs only (Unsplash / Storage later)  
- Accent must pass contrast vs text  

---

## MVP build slices (this delivery)

1. Docs (this file) + IA/MVP updates  
2. Migration: centers, center_members, listings.center_id, donor_stats, profile_themes  
3. Seed 3–4 Bhutan-flavored centers  
4. `/donate/centers` + detail + composer `center_id`  
5. Donor tier badge on profile + public profile  
6. Profile theme editor + themed public profile  

## Acceptance

- [x] User browses centers and lists a donation tagged to an orphanage  
- [x] Center page shows its tagged verified items  
- [x] After verified donations, profile shows tier/points  
- [x] User customizes banner/accent/bio; public page reflects theme  
- [x] Mobile + desktop parity for new surfaces  

## Out of scope (next)

- Money donations to centers  
- Center self-signup KYC portal  
- Full Tumblr post/blog feed  
- Push notifications for tier ups  

## Production inventory

Hyper-specific front / API / route / middleware / schema + phased build:

→ [../production/00-index.md](../production/00-index.md)  
→ [../production/donation-domain.md](../production/donation-domain.md)  
→ [../production/phased-roadmap.md](../production/phased-roadmap.md)  
