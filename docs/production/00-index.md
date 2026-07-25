# Production documentation index

**Audience:** engineers shipping Zyra to production  
**Source of truth for “what exists in code today”** — not aspirational product notes.

| Doc | Contents |
| --- | --- |
| [system-map.md](./system-map.md) | Every App route, API route, middleware, auth gate |
| [schema-reference.md](./schema-reference.md) | Migrations order + tables/columns/RLS (donation domain deep) |
| [donation-domain.md](./donation-domain.md) | Hyper-specific front ↔ DB ↔ flows for centres / tiers / themes |
| [phased-roadmap.md](./phased-roadmap.md) | Phased implementation plan (P0–P3) |

Product intent (non-inventory): [../product/donation-centers-and-profiles.md](../product/donation-centers-and-profiles.md)

## Production rules

1. **Live data only** on user-facing pages — no mock arrays in shipped routes.  
2. **Mobile = desktop** for every feature ([../product/mobile-desktop-parity.md](../product/mobile-desktop-parity.md)).  
3. **Schema changes** = new file under `supabase/migrations/`; apply to project `ynnmfnoxxwtpiiwrnpup` before merge.  
4. **Auth:** middleware refreshes session only; pages/APIs enforce access.  
5. Dead/mock components must not be imported by `src/app/**/page.tsx`.
