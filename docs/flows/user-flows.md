# User Flows

Flows are written for the usability-test prototype. Happy paths first; edge cases noted briefly.

---

## A. Sign up & location setup

```mermaid
flowchart LR
  A[Welcome] --> B[Sign up]
  B --> C[Create account]
  C --> D[Location setup]
  D --> E[Optional meetup points]
  E --> F[Home]
```

**Steps**

1. User opens Zyra → Welcome  
2. Sign up: display name, email/username, password, age confirmation  
3. Prompt: “Where do you usually meet?” → city/area + optional named meetup pins (e.g. “Mall food court”, “Library steps”)  
4. Land on Home  

**Edge:** Skip meetup points → remind later from Profile / before first COD sale.

---

## B. Sell on marketplace (with verification)

```mermaid
flowchart TD
  A[Market / Sell CTA] --> B[Item details]
  B --> C[Multi-angle photos]
  C --> D[Price + condition]
  D --> E[Review submit]
  E --> F[Status: Pending Verification]
  F --> G{Admin}
  G -->|Approve| H[Verified — live]
  G -->|Reject| I[Rejected + reason]
```

**Photo angles (recommended fixed set for MVP)**

| Angle | Why |
| --- | --- |
| Front | Primary look |
| Back | Completeness |
| Tag / label | Brand/size authenticity |
| Close-up / defect | Trust on condition |

Allow “Add more” after the required set.

**Seller sees:** badge “Pending Verification — not visible to buyers yet.”

---

## C. Buy (COD or Online)

```mermaid
flowchart TD
  A[Browse Market] --> B[Open verified item]
  B --> C[View photos + badge]
  C --> D[Price breakdown]
  D --> E{Payment method}
  E -->|COD| F[Confirm meetup preference]
  E -->|Online| G[Mock online checkout]
  F --> H[Request sent]
  G --> H
  H --> I[Activity: transaction status]
```

**Price breakdown (always shown before confirm)**

- Item price  
- Platform fee (if any; show even if ₱0 / $0 for research clarity)  
- **Total**  
- Short note: COD = pay at meetup; Online = pay now (simulated)

---

## D. Donate & claim

```mermaid
flowchart TD
  A[Donation Hub] --> B[List donation]
  B --> C[Photos + basic details]
  C --> D[Published or Pending*]
  D --> E[Browse donations]
  E --> F[Claim / Request]
  F --> G[Donor reviews claim]
  G --> H[Arrange pickup]
```

\*MVP choice: donations can skip photo verification **or** share the same queue (simpler trust story if same queue). Default proposal: **same pending queue** for consistency; light review for free items.

---

## E. Admin verification

```mermaid
flowchart LR
  A[Queue list] --> B[Open listing]
  B --> C[Review all angles]
  C --> D{Decision}
  D -->|Verify| E[Live + Verified by Zyra]
  D -->|Reject| F[Notify seller + reason]
```

Also: transactions board — filter by status (requested, completed, cancelled).

---

## F. Critical path for testing (scripted)

| # | Task | Primary persona |
| --- | --- | --- |
| 1 | Create account + set meetup point | Maya |
| 2 | List an item with 4 angles | Maya |
| 3 | As admin, verify the listing | Alex |
| 4 | As buyer, find item, choose COD, confirm | Jordan |
| 5 | List a donation + claim as another user | Sam / Org |

See [research/usability-plan.md](../research/usability-plan.md) for measures.
