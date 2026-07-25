# Zyra — Project Documentation

Teen-focused circular fashion platform: **Peer-to-Peer Marketplace** + **Donation Hub** + admin verification.

This folder is the **drawing board** — product intent, flows, wireframes, live-data stack, and MVP scope. **Implementation starts from these docs.**

## Start here

| Doc | Purpose |
| --- | --- |
| [drawing-board/00-index.md](./drawing-board/00-index.md) | Locked decisions & doc map |
| [drawing-board/interaction-principles.md](./drawing-board/interaction-principles.md) | Fewer clicks, more done |
| [product/vision.md](./product/vision.md) | Problem, goals, principles |
| [product/personas.md](./product/personas.md) | Teen / org / admin personas |
| [product/information-architecture.md](./product/information-architecture.md) | Screens, nav, roles |
| [flows/user-flows.md](./flows/user-flows.md) | End-to-end flows |
| [drawing-board/wireframes.md](./drawing-board/wireframes.md) | Low-fi layouts |
| [drawing-board/trust-and-verification.md](./drawing-board/trust-and-verification.md) | Badges & payments |
| [product/mvp-scope.md](./product/mvp-scope.md) | In/out of scope + acceptance |
| [product/tech-sketch.md](./product/tech-sketch.md) | Next.js + Supabase + Stripe |
| [product/data-model.md](./product/data-model.md) | Schema, RLS, live-data rules |
| [product/ui-system.md](./product/ui-system.md) | shadcn component map |
| [product/mobile-desktop-parity.md](./product/mobile-desktop-parity.md) | **Hard rule:** desktop features = mobile features |
| [product/admin-erp.md](./product/admin-erp.md) | ERP modules to run the live site |
| [product/donation-centers-and-profiles.md](./product/donation-centers-and-profiles.md) | Orphanages/centers, donor tiers, Tumblr-like profiles |
| [production/00-index.md](./production/00-index.md) | **Production:** routes, APIs, middleware, schema, phases |
| [production/production-readiness.md](./production/production-readiness.md) | **Honest ship checklist** — what is / isn’t production-ready |
| [research/usability-plan.md](./research/usability-plan.md) | Research tasks & measures |
| [research/marketplace-payment-model.md](./research/marketplace-payment-model.md) | Split payment ledger |

## Status

**Phase:** MVP live + Depop Phase 1–3 (desktop shell, admin/ERP/CMS, hero/personalization/A/B)  
**Parity:** Every user-facing and admin feature must work on **mobile and desktop** — see [mobile-desktop-parity.md](./product/mobile-desktop-parity.md)  
**ERP:** Ops control plane documented in [admin-erp.md](./product/admin-erp.md) (`AdminShell` on all `/admin/*` routes)  
**Backend:** Supabase project `ynnmfnoxxwtpiiwrnpup` (live Postgres / Auth / Storage)  
**Next:** Usability research (T1–T5); Depop Phase 4–5 optional
