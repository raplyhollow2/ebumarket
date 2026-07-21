# User Flows

Happy paths for the live-data MVP. Designed for **fewer clicks** — see [interaction-principles.md](../drawing-board/interaction-principles.md).

---

## A. Sign up (one pass)

```mermaid
flowchart LR
  Browse[Browse as guest] --> Action[Sell Buy or Claim]
  Action --> AuthSheet[Auth Sheet]
  AuthSheet --> Profile[Name credentials 13+ area meetup optional]
  Profile --> Continue[Continue original action]
```

**Steps**

1. Guest browses freely.  
2. Protected action opens Auth Sheet.  
3. Sign up: display name, email, password, **13+** checkbox, short under-16 parental note, area, optional first meetup.  
4. `profiles` + optional `meetup_points` written to Supabase; continue the interrupted action.

**Edge:** Skip meetup → allowed; COD later opens inline quick-add.

---

## B. Sell (single composer → pending)

```mermaid
flowchart TD
  A[Sell CTA] --> B[Composer: details + photo slots + price]
  B --> C[Submit]
  C --> D[listing status pending in Supabase]
  D --> E{Admin}
  E -->|Approve| F[verified — live in Market]
  E -->|Reject| G[rejected + reason — edit resubmit]
```

**Photo angles (required):** Front, Back, Tag, Defect — each slot uploads to Supabase Storage + `listing_photos`.

**Seller sees:** Pending badge in Activity; not visible in public Market.

**Click target:** one Submit after fill.

---

## C. Buy (Sheet on detail)

```mermaid
flowchart TD
  A[Open verified item + seller profile] --> B[Buy Sheet]
  B --> C[Split: item + 5% fee = total paid to platform]
  C --> D{Method}
  D -->|COD| E[Meetup → tx requested → seller Activity]
  D -->|Online| F[Stripe Checkout: buyer pays Zyra]
  E --> G[Seller accept / decline / confirm cash]
  F --> H[Webhook: paid + payout claimable]
  H --> I[Seller claims payout · admin marks paid out]
  G --> J[Activity for buyer and seller]
  I --> J
```

**Price breakdown (always):** item · platform fee (default 5%) · **total paid to Zyra** · **seller receives** · method.

**Routing:** every buy creates a `transactions` row with `seller_id` = listing owner; seller sees it under Activity → Selling / Buys inbox.

**Click target:** ≤2 taps when logged in with meetup saved.

See [marketplace-payment-model.md](../research/marketplace-payment-model.md).

---

## D. Donate / claim

**List donation:** same single-composer pattern; `price_cents` null; enters **pending** verification (same queue).

**Claim:** Sheet on detail — message, contact, pickup preference, org self-describe if needed → `donation_claims` row. Donor approves/declines from Activity.

---

## E. Admin verify (inline)

```mermaid
flowchart LR
  Q[Queue row + photo strip] --> A[Approve]
  Q --> R[Reject + reason AlertDialog]
  A --> V[status verified + audit_events]
  R --> X[status rejected + reason]
```

**Click target:** Approve = 1 tap from queue.

---

## Facilitator script map

| Research task | Flow |
| --- | --- |
| T1 Account + meetup | A |
| T2 List item + photos | B |
| T3 Admin verify | E |
| T4 Buy COD + explain total | C |
| T5 Donate or claim | D |
