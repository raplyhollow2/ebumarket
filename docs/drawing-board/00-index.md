# Drawing Board Index

Use this set as the shared planning surface before UI polish or code.

## What “drawing board” means here

1. **Align** on problem, users, and MVP boundaries  
2. **Map** information architecture and critical paths  
3. **Sketch** screens at low fidelity (structure > visuals)  
4. **Define** trust/verification and payment transparency rules  
5. **Plan** usability research so the prototype answers real questions  

## Document map

```text
docs/
├── README.md                          ← docs entry
├── drawing-board/
│   ├── 00-index.md                    ← you are here
│   ├── wireframes.md                  ← screen layouts
│   └── trust-and-verification.md      ← badges, queue, fees
├── product/
│   ├── vision.md
│   ├── personas.md
│   ├── information-architecture.md
│   ├── mvp-scope.md
│   └── tech-sketch.md
├── flows/
│   └── user-flows.md
└── research/
    └── usability-plan.md
```

## Decisions locked for MVP (proposed)

| Topic | Decision |
| --- | --- |
| Audience | Teens (approx. 13–19); UI language simple and direct |
| Cores | Marketplace (paid) + Donation Hub (free) |
| Trust | Listings start **Pending Verification**; go live when admin verifies |
| Payments | COD meetup **or** Online Transaction (simulated in prototype) |
| Location | General area + optional meetup points on profile |
| Admin | Review queue, approve/reject, track transactions/statuses |
| Fidelity | Functional interactive prototype for usability testing |

## Open questions (to resolve before/during build)

- [ ] Age gate / parental consent messaging for under-16?
- [ ] Online payment: real gateway vs. mock checkout for research?
- [ ] Fee model: flat platform fee, % of sale, or none in MVP?
- [ ] Meetup safety: in-app tips only, or required public meetup tags?
- [ ] Org accounts for donation claims vs. same teen accounts?
- [ ] Photo angles: fixed set (front / back / tag / defect) or free multi-upload?

## Suggested review order

1. Vision → Personas  
2. IA → User flows  
3. Wireframes + Trust rules  
4. MVP scope → Usability plan  
5. Tech sketch (only when ready to implement)
