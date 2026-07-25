# Desktop Experience — Status (superseded by parity rule)

Desktop layout work from Phase 1 is largely landed. Going forward, **do not treat desktop as a separate feature track**.

## Current rule

See **[product/mobile-desktop-parity.md](./product/mobile-desktop-parity.md)**:

> Any feature shipped for desktop must be available on mobile in the same release.

Desktop may use hover affordances (e.g. Quick View overlay) **only if** mobile has an explicit equivalent control (e.g. Quick View icon on the card).

## Resolved

- Market/donate/detail/home use `ResponsiveLayoutWrapper` (CSS-first, no mobile flash)
- Home hero uses responsive Tailwind (stacked CTAs on mobile, horizontal on desktop)
- Listing cards: like / share / Quick View available on both viewports
- Sell/donate composers use the same responsive shell
- Admin ERP uses `AdminShell` with horizontal module nav on phone

## Still optional polish (not capability gaps)

- Richer desktop image gallery chrome  
- Mega-menu category browsing  
- Keyboard shortcuts for power users  

These must not gate core marketplace or ERP workflows on either viewport.
