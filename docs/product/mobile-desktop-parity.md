# Mobile ↔ Desktop Feature Parity

**Hard rule:** Any feature shipped for desktop **must** be available on mobile in the same release. Layout and interaction patterns may differ; capability must not.

## Why

Zyra is teen-first and mobile-primary. Desktop enhancements (grids, hover Quick View, ERP dashboards) are adaptations — not a second product. Shipping desktop-only capability creates a broken experience for the main audience.

## Parity contract

| Capability | Desktop pattern | Mobile pattern | Required |
| --- | --- | --- | --- |
| Browse market / donate | Multi-column grid | 2-col grid | Yes |
| Listing like / share | Hover icons + card actions | Always-visible card actions | Yes |
| Quick View | Hover overlay → dialog | Explicit “Quick view” control → same dialog | Yes |
| Seller / donor profile | Name link on detail | Same link on detail | Yes |
| Buy / Claim | Sheet or side panel | Bottom Sheet | Yes |
| Sell / donate composer | Full-width desktop shell | Teen shell, same fields | Yes |
| Split payment breakdown | Buy Sheet | Same Buy Sheet | Yes |
| Seller buy inbox / payout claim | Activity tabs | Same Activity tabs | Yes |
| Personalized feed | Home section | Same Home section | Yes |
| CMS hero (active) | Homepage slider | Same slider, stacked CTAs | Yes |
| Admin ERP modules | Sidebar + wide tables | Sticky module nav + scrollable tables | Yes |
| CMS / A/B / settings | Admin routes | Same routes, touch-friendly controls | Yes |

## Non-negotiables

1. **No desktop-only product features** — if it exists behind `md:` or `isDesktop`, mobile must have an equivalent control.
2. **Same data, same APIs** — both shells call the same Supabase/API routes.
3. **Admin ERP runs the site on phone** — approvers and ops staff can complete queue, transactions, CMS, experiments, and settings without a desktop.
4. **Test both viewports** before merge: phone-width (~390) and desktop (≥768).

## Implementation checklist (per feature)

- [ ] Works in `TeenShell` / mobile branch of `ResponsiveLayoutWrapper`
- [ ] Works in `DesktopShell`
- [ ] Touch targets ≥ 44px on mobile
- [ ] No hover-only primary action
- [ ] Documented in this table if user-facing

## Related

- [ui-system.md](./ui-system.md) — shells & components  
- [admin-erp.md](./admin-erp.md) — ERP modules for running the site  
- [information-architecture.md](./information-architecture.md) — routes  
