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
Item price        …
Platform fee      …   (disclose even if zero)
─────────────────
Total due         …
Pay by: COD | Online
```

Fee percent from env / `app_config` (`PLATFORM_FEE_PERCENT`).

---

## Transaction statuses

| Status | Meaning |
| --- | --- |
| `requested` | COD intent submitted |
| `awaiting_payment` | Stripe session opened |
| `paid` | Stripe webhook confirmed |
| `accepted` | Seller accepted (optional MVP step) |
| `completed` | Meetup / fulfillment done |
| `cancelled` | Cancelled by party or system |

Admin transactions board mirrors these from live queries.

---

## Safety copy (COD confirm)

> Meet in a public place from your meetup list. Don’t share your home address in chat.

(Full chat out of scope; static tip is enough.)
