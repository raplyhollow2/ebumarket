# Drawing Board Index

Shared planning surface before implementation. **Code starts from these docs.**

## What “drawing board” means here

1. Align on problem, users, and MVP boundaries  
2. Map information architecture and critical paths  
3. Sketch screens at low fidelity (structure > visuals)  
4. Define trust/verification and payment transparency  
5. Lock live-data stack (Supabase) and low-friction UX  
6. Plan usability research  

## Document map

```text
docs/
├── README.md
├── drawing-board/
│   ├── 00-index.md                    ← you are here
│   ├── interaction-principles.md      ← fewer clicks
│   ├── wireframes.md
│   ├── trust-and-verification.md
│   └── requirements-traceability.md
├── product/
│   ├── vision.md
│   ├── personas.md
│   ├── information-architecture.md
│   ├── mvp-scope.md
│   ├── tech-sketch.md                 ← Supabase stack (committed)
│   ├── data-model.md                  ← live schema + RLS
│   └── ui-system.md                   ← shadcn map
├── flows/
│   └── user-flows.md
└── research/
    ├── usability-plan.md
    └── marketplace-payment-model.md  ← buyer→platform→seller 5% split
```

## Decisions locked for MVP

| Topic | Decision |
| --- | --- |
| Audience | Teens (approx. 13–19); simple, direct language |
| Cores | Marketplace (paid) + Donation Hub (free) |
| Trust | Listings start **Pending Verification**; go live when admin verifies |
| Age gate | **13+ confirmation** on signup; short under-16 parental note in copy |
| Payments | Buyer pays **platform** (COD meetup or Stripe test); seller claims payout |
| Fee | Default **5%** (`PLATFORM_FEE_PERCENT` / admin); platform keeps fee, seller gets item price |
| Split | Ledger: `fee_cents` · `seller_payout_cents` · `payout_status` (claim → paid out) |
| Profiles | Public `/profile/[id]` for buyers & sellers; linked from listings & Activity |
| Buy requests | Always routed to listing `seller_id` in Activity (accept / decline / claim) |
| Meetup | COD requires a **saved meetup point** (inline quick-add if missing) |
| Org claimers | Same account + `is_organization` flag |
| Photos | Fixed required angles: Front / Back / Tag / Defect + “Add more” |
| Donations verify | Same admin verification queue as marketplace |
| Data | **All live on Supabase** — no client-only DB |
| UI | **shadcn/ui** + Tailwind; sheets/composers over wizards |
| Admin | Inline approve/reject on queue; transactions DataTable |
| Fidelity | Interactive MVP on live data for usability testing |

## Suggested review order

1. Vision → Personas  
2. Interaction principles → IA → User flows  
3. Wireframes + Trust rules  
4. MVP scope → Data model → Tech sketch → UI system  
5. Usability plan  

## Implementation gate

Do not start app code until this index’s locked decisions are accepted. Then implement against [tech-sketch.md](../product/tech-sketch.md) and [data-model.md](../product/data-model.md).
