# Progressive Web App (PWA)

Zyra installs as a standalone app on mobile/desktop.

## What’s included

| Piece | Path |
| --- | --- |
| Web app manifest | `src/app/manifest.ts` → `/manifest.webmanifest` |
| Service worker | `public/sw.js` |
| Icons | `public/icons/*` |
| Install banner | `src/components/pwa/ServiceWorkerRegister.tsx` |
| Meta / theme | `src/app/layout.tsx` (`appleWebApp`, `themeColor`, icons) |

## Behaviour

- **display:** `standalone`
- **theme / background:** forest `#1c3024` / cream `#f7f4ef`
- **Cache:** shell + `/bhutan/*` + `/_next/static/*` (stale-while-revalidate)
- **Navigations:** network-first, fall back to cached `/`
- **Never cached:** `/api/*`, checkout paths

## Install

1. Deploy over **HTTPS**
2. Open in Chrome/Safari → browser “Add to Home Screen” / Install
3. Android Chrome may show the in-app **Install Zyra** chip once

## Dev note

Service worker registers in production and on `localhost`. Hard-refresh or unregister SW when debugging stale caches (`Application → Service Workers` in DevTools).
