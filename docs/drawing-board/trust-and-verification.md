# Trust, Verification & Payments

Usability research needs teens to **notice**, **understand**, and **trust** verification and payment transparency. All states below are **live rows** in Supabase.

---

## Listing verification states

| Status | Who sees listing | Badge copy | Meaning |
| --- | --- | --- | --- |
| `pending` | Seller + Admin | **Pending Verification** | Submitted; not in public Market |
| `verified` | Everyone | **Verified by Zyra** | Photos/details reviewed; live |
| `rejected` | Seller + Admin | **Needs changes** | Edit & resubmit → `pending` |
| `sold` / `claimed` / `closed` | Contextual | **Sold** / **Claimed** / **Closed** | Unavailable |

### Admin review checklist (MVP)

- [ ] Required angles present (front, back, tag, defect)  
- [ ] Photos look like the same item  
- [ ] No obvious prohibited content  
- [ ] Size/condition fields filled  
- [ ] Price reasonable (marketplace)  

Reject requires a short reason (stored on listing, shown to seller). Write `audit_events` on approve/reject.

### Donation items

**Locked:** same verification queue so trust language stays consistent.

---

## Badge placement

1. Item detail: directly under title  
2. Browse tiles: small verified mark (live items only)  
3. Activity: full status chip including Pending  
4. Never show Pending in public Market browse  

First-time helper:  
> “Verified by Zyra means our team checked the listing photos.”

---

## Payment methods

| Method | Use case | Live behavior |
| --- | --- | --- |
| **COD** | Face-to-face meetup | Requires meetup point → insert `transactions` (`requested`) |
| **Online** | Card / prepay | Stripe Checkout **test mode** → webhook updates status (`awaiting_payment` → `paid`) |

### Transparency breakdown (required UI)

Always show in Buy Sheet before confirm:

```text
Item price           …   → seller receives this
Platform fee (5%)    …   → Zyra keeps this
─────────────────
Total paid to Zyra   …
Pay by: COD | Online
```

Fee percent from env / `app_config` (`PLATFORM_FEE_PERCENT`, default **5**).

**Split settlement:** Buyer always pays the **platform**. Online: webhook marks `paid` and `payout_status = claimable`; seller **claims payment**; admin marks `paid_out`. COD: seller accepts request, confirms cash at meetup (`seller_payout` not held by platform → `not_applicable`). Full design: [marketplace-payment-model.md](../research/marketplace-payment-model.md).

---

## Transaction statuses

| Status | Meaning |
| --- | --- |
| `requested` | COD intent submitted — **visible to seller** |
| `awaiting_payment` | Stripe session opened |
| `paid` | Platform received online payment (or COD cash confirmed) |
| `accepted` | Seller accepted COD request |
| `completed` | Meetup / fulfillment done |
| `cancelled` | Cancelled by party or system |

### Payout statuses (online split)

| Status | Meaning |
| --- | --- |
| `pending` | Waiting for buyer payment |
| `claimable` | Seller may claim their share |
| `claimed` | Seller claimed; awaiting delivery |
| `paid_out` | Platform delivered seller share |
| `not_applicable` | COD — seller took cash at meetup |

Admin transactions board mirrors fee, seller payout, and payout status from live queries.

---

## Safety copy (COD confirm)

> Meet in a public place from your meetup list. Don’t share your home address in chat.

(Full chat out of scope; static tip is enough.)
