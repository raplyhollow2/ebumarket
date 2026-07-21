# Requirements Traceability

Maps the project brief to drawing-board docs and MVP inclusion.

| Brief requirement | Doc(s) | MVP |
| --- | --- | --- |
| Sign-up / login for teens | personas, flows A, wireframes Auth Sheet, mvp-scope | Yes — Supabase Auth |
| Location / meetup points | flows A, wireframes Profile, data-model | Yes — live `meetup_points` |
| Multi-angle photo upload | flows B, wireframes Sell composer, trust checklist | Yes — Storage + fixed 4 angles |
| Pending before live | trust-and-verification, flows B/E | Yes |
| Admin badge Pending vs Verified by Zyra | trust-and-verification, ui-system | Yes |
| COD vs Online payment | flows C, trust payments, tech-sketch | Yes — COD + Stripe test |
| Price / fee breakdown | trust-and-verification, Buy Sheet | Yes — % fee always shown |
| Donation listings | flows D, wireframes, mvp-scope | Yes |
| Claim / request donations | flows D, Claim Sheet | Yes |
| Admin review/approve listings | flows E, inline queue wireframe | Yes |
| Admin track transactions/statuses | wireframes Admin tx, data-model | Yes |
| Mobile-friendly teen UI | vision, ui-system, wireframes | Yes — shadcn shell |
| Usability / trust research ready | usability-plan, mvp acceptance | Yes |
| Live multi-user data | tech-sketch, data-model, mvp-scope | Yes — Supabase only |
| Low-friction UX | interaction-principles, IA, flows | Yes — composers + sheets |

## Locked defaults

1. Required photo angles: Front, Back, Tag, Defect/close-up  
2. Donations use the **same** verification queue  
3. Platform fee = configurable **percent**; always shown  
4. Online pay = **Stripe test mode** (live rows + webhooks)  
5. Org claimers = same account + `is_organization`  
6. Age = **13+** checkbox + under-16 parental note  
7. Stack = Next.js + shadcn + Supabase (project `ynnmfnoxxwtpiiwrnpup`)  
