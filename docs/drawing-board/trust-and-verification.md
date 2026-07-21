# Trust, Verification & Payments

## Why this exists

Usability research needs to measure whether teens **notice**, **understand**, and **trust** Zyra’s verification and payment transparency.

---

## Listing verification states

| Status | Who sees listing | Badge copy | Meaning |
| --- | --- | --- | --- |
| `pending` | Seller + Admin | **Pending Verification** | Submitted; not in public Market |
| `verified` | Everyone | **Verified by Zyra** | Photos/details reviewed; live |
| `rejected` | Seller + Admin | **Needs changes** | Seller must edit & resubmit |
| `sold` / `closed` | Contextual | **Sold** / **Closed** | No longer available |

### Admin review checklist (MVP)

- [ ] Required angles present  
- [ ] Photos look like the same item  
- [ ] No obvious prohibited content  
- [ ] Size/condition fields filled  
- [ ] Price reasonable (marketplace)  

Reject requires a short reason (shown to seller).

### Donation items

**Proposal:** same queue so trust language stays consistent. If review load is too high for research, donations can auto-publish with a weaker “Community listing” label — decide before build.

---

## Badge placement rules

1. Item detail: directly under title  
2. Browse tiles: small verified mark (live items only)  
3. Seller Activity: full status chip including Pending  
4. Never show Pending items in public Market browse  

Helper text (first time):  
> “Verified by Zyra means our team checked the listing photos.”

---

## Payment methods

| Method | Use case | Prototype behavior |
| --- | --- | --- |
| **Cash on Delivery (COD)** | Face-to-face meetup | Select meetup preference → create transaction `requested` |
| **Online Transaction** | Remote/prepay preference | Mock checkout confirmation → `requested` or `paid_simulated` |

### Transparency breakdown (required UI)

Always show before confirm:

```text
Item price        …
Platform fee      …   (disclose even if zero)
─────────────────
Total due         …
Pay by: COD | Online
```

Optional research toggle: non-zero fee vs zero fee to test fee sensitivity.

---

## Transaction statuses (marketplace)

| Status | Meaning |
| --- | --- |
| `requested` | Buyer submitted intent |
| `accepted` | Seller accepted (optional step in MVP) |
| `completed` | Marked done (meetup happened / mock pay done) |
| `cancelled` | Either party cancelled |

Admin board mirrors these for oversight.

---

## Safety copy (lightweight, MVP)

On COD confirm:

> Meet in a public place from your meetup list. Don’t share your home address in chat.

(Full chat may be out of scope; show as static tip if no messaging.)
