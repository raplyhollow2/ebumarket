# Information Architecture

Low-friction IA: fewer routes, sheets for commit actions, live Supabase behind every surface.

## Roles

| Role | Access |
| --- | --- |
| Guest | Browse verified Market & Donate; auth Sheet on Sell / Buy / Claim |
| Teen user | Profile, sell, buy, donate, claim, Activity |
| Organization | Same as user + `is_organization` on profile / claim form |
| Admin | `/admin` queue + transactions (no teen tab bar) |

## Primary navigation (mobile)

```text
[ Home ]  [ Market ]  [ Donate ]  [ Activity ]  [ Profile ]
```

| Tab | Contents |
| --- | --- |
| Home | Brand hero + dual CTAs: Shop / Donate |
| Market | Verified listings + Sell CTA → composer |
| Donate | Hub browse + List donation → composer |
| Activity | Unified live inbox: listings, buys, claims |
| Profile | Account, area, meetup points, logout |

## Screen inventory (MVP)

### Core routes

- Home  
- Market browse / Market detail (+ **Buy Sheet**)  
- Sell composer (`/market/new`) — single screen  
- Donate browse / Donate detail (+ **Claim Sheet**)  
- Donate composer (`/donate/new`) — single screen  
- Activity (unified)  
- Profile (includes meetup CRUD)  
- Auth Sheet (signup/login; not a hard gate for browse)  

### Admin routes

- Verification queue (inline Approve / Reject)  
- Transactions DataTable  

### Removed vs earlier wizard IA

- Separate location-only onboarding page (folded into signup + Profile)  
- Multi-step sell routes (details → photos → review)  
- Standalone checkout page (replaced by Buy Sheet)  
- Separate “my listings” / “my transactions” teen pages (merged into Activity)  

## Content objects (live tables)

See [data-model.md](./data-model.md): `profiles`, `meetup_points`, `listings`, `listing_photos`, `transactions`, `donation_claims`, `audit_events`.

## Hierarchy

```mermaid
flowchart TB
  Home --> Market
  Home --> Donate
  Market --> ItemDetail
  ItemDetail --> BuySheet
  Market --> SellComposer
  Donate --> DonationDetail
  DonationDetail --> ClaimSheet
  Donate --> DonateComposer
  Profile --> MeetupCRUD
  Activity --> LiveRows
  Admin --> VerifyQueue
  Admin --> TxBoard
```
