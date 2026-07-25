# UI System — shadcn/ui

Zyra’s UI is built with **Tailwind CSS + shadcn/ui** (Radix primitives). This doc maps product surfaces to components so implementation stays consistent and low-friction.

## Principles

1. **Mobile-first** — single column; thumb-reach primary actions
2. **Feature parity** — anything on desktop must also work on mobile (see [mobile-desktop-parity.md](./mobile-desktop-parity.md)); only layout/interaction may differ
3. **Fewer screens** — prefer **Sheet** / **Dialog** over new routes for Buy, Claim, Auth
4. **Trust visible** — verification **Badge** always next to title on detail; mark on browse tiles
5. **Brand first on Home** — Zyra is the hero signal; no dashboard clutter in first viewport
6. **Cards only for interaction** — listing tiles in browse grids; avoid decorative card chrome elsewhere
7. **Large tap targets** — teen-friendly; sticky primary CTA on long composers; no hover-only primary actions

## Component map

| Need | shadcn component |
| --- | --- |
| Primary / secondary actions | `Button` |
| Buy / Claim / Auth overlays | `Sheet` (mobile bottom), `Dialog` (desktop optional) |
| Forms | `Form` + `Input` + `Textarea` + `Select` + `Checkbox` + `Label` |
| Verification / status | `Badge` |
| Sell / donate photo slots | `Button` + file input; optional `Progress` |
| Tabs (Activity filters) | `Tabs` |
| Admin queue / tx board | `Table` / DataTable pattern + `DropdownMenu` |
| Confirm destructive (reject) | `AlertDialog` |
| Toasts | `Sonner` or `Toast` |
| Empty / loading | `Skeleton` |
| Command palette (admin optional) | `Command` |
| Separators / layout | `Separator`, `ScrollArea` |

## Shell

### Teen app

```text
┌─────────────────────────┐
│  page content           │
│                         │
├─────────────────────────┤
│ Home Market Donate      │
│ Activity Profile        │  ← bottom nav
└─────────────────────────┘
```

### Admin ERP

Shared `AdminShell` (no teen tab bar):

- **Mobile:** sticky header + horizontal scroll module chips  
- **Desktop:** left sidebar  

Modules: Dashboard | Queue | Money | CMS | A/B | Stats | Settings — see [admin-erp.md](./admin-erp.md).

## Status badge copy

| Status | Badge |
| --- | --- |
| pending | `Pending Verification` |
| verified | `Verified by Zyra` |
| rejected | `Needs changes` |
| sold / claimed / closed | matching chip |

## Price breakdown block (required before buy confirm)

Always show in Buy Sheet:

- Item price  
- Platform fee (even if $0)  
- **Total**  
- Pay method: COD | Online  

## Motion (intentional, light)

1. Sheet slide-up for Buy / Claim / Auth  
2. Subtle badge appear on verified detail  
3. Sticky CTA shadow when composer scrolls  

Avoid decorative glow, purple SaaS defaults, and emoji-heavy chrome.

## Typography & color

Define CSS variables in implementation. Direction: circular fashion / secondhand culture, real clothing imagery — not abstract purple gradients or cream+terracotta clichés. Expressive fonts via Next font loader (not Inter/Roboto/Arial as the brand voice).

## Accessibility baseline

- Focus rings on interactive controls  
- Form errors announced inline  
- Badge text not color-only  
- Tap targets ≥ 44px where primary
