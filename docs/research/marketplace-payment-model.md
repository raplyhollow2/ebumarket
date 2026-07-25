# Marketplace payment model — research & design

Zyra connects **sellers** (post listings) and **buyers** (pay for items). The platform is the **payment intermediary**: buyers pay Zyra, Zyra keeps a **5% platform fee**, and Zyra pays the seller their share.

## Problem (current gaps)

| Gap | What users experience |
| --- | --- |
| No buyer/seller profiles | Market detail hides seller name; no public `/profile/[id]` |
| Buy requests don’t reach sellers | `transactions.seller_id` is set, but Activity only queries `buyer_id` |
| No claim of payment | Sellers cannot accept COD requests or claim online payouts |
| No split settlement | Stripe Checkout charges the full total to the platform account; fee is stored but never separated for seller delivery |

## Locked money flow

```text
Seller posts item at price P
        │
Buyer opens Buy Sheet
        │
        ├─ Sees: Item P · Platform fee F (default 5% of P) · Total T = P + F
        │
        ▼
Buyer pays Zyra (platform) ─── T
        │
        ├─ Platform keeps ─── F  (fee_cents)
        └─ Seller receives ─── P  (seller_payout_cents)
```

**Rules**

1. **Seller posts** marketplace listings; buyers never pay the seller’s personal account directly for online checkout.
2. **Buyer pays the platform** (Stripe Checkout in test mode, or COD meetup cash for the item while the fee remains recorded).
3. **Buying requests route to the listing’s seller** (`seller_id` on the transaction → seller Activity inbox).
4. **Split is always explicit** in UI and DB: item / fee / total / seller payout / payout status.
5. Default fee is **5%** (`app_config.platform_fee_percent` / `PLATFORM_FEE_PERCENT`), editable by admin.

### COD vs online

| Method | Buyer action | Seller action | Split |
| --- | --- | --- | --- |
| **COD** | Confirm meetup → `requested` | Accept / decline → confirm cash received → `completed` | Seller gets cash **P** at meetup; platform records fee **F** as platform share (collected offline / later ops) |
| **Online** | Pay Zyra via Stripe → webhook → `paid` | **Claim payout** for **P** → admin marks `paid_out` | Zyra holds **T**; keeps **F**; delivers **P** to seller |

## Status machines

### Transaction (`status`)

| Status | Meaning |
| --- | --- |
| `requested` | COD buy request waiting on seller |
| `awaiting_payment` | Online checkout started |
| `paid` | Platform has received online payment (or COD cash confirmed) |
| `accepted` | Seller accepted a COD request |
| `completed` | Fulfillment done (meetup finished / item delivered) |
| `cancelled` | Declined or cancelled |

### Payout (`payout_status`)

| Status | Meaning |
| --- | --- |
| `not_applicable` | COD path where seller already took cash at meetup (no platform-held seller share) |
| `pending` | Online payment not yet received |
| `claimable` | Platform holds seller share; seller may claim |
| `claimed` | Seller claimed; awaiting platform delivery |
| `paid_out` | Platform marked seller share delivered |

## Profiles

- **Public profile** `/profile/[id]`: display name, area, org flag, verified listings (marketplace + donations).
- **Own profile** `/profile`: edit name/area, meetup spots, logout.
- Listing detail and Activity always show the other party’s name with a link to their public profile.

## Why not full Stripe Connect yet

Production Connect (Express accounts, KYC, automatic destination charges) remains a later slice. This MVP implements the **correct product ledger** and claim UX so research and ops can run the split manually:

- Checkout still lands on the platform Stripe account (buyer → platform).
- `fee_cents` / `seller_payout_cents` / `payout_status` make the 5% split auditable.
- Seller **Claim payment** + admin **Mark paid out** close the loop without KYC.

When Connect is enabled later, map:

- `application_fee_amount` → `fee_cents`
- transfer / destination amount → `seller_payout_cents`
- transfer succeeded → `payout_status = paid_out`

## Acceptance checks

- [ ] Buyer sees seller name + profile link on market detail
- [ ] Seller sees incoming buy requests in Activity and can accept/decline
- [ ] Online: after pay, seller can claim payout; admin can mark paid out
- [ ] Buy Sheet and admin transactions show item / fee / seller share
- [ ] Fee % comes from `app_config` in both Buy Sheet and `/api/checkout`
