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

1. Deploy over **HTTPS** (required except `localhost`)
2. Open the site, wait ~2s — install chip appears:
   - **Android Chrome:** Install button (when browser fires `beforeinstallprompt`)
   - **iPhone Safari:** instructions — Share → Add to Home Screen
   - **Fallback tip:** Chrome ⋮ → Install app
3. If you dismissed it, it reappears after 3 days (or clear `localStorage.zyra-pwa-dismissed`)

### Why the Chrome Install button sometimes doesn’t appear

`beforeinstallprompt` only fires when Chrome decides the app is installable (HTTPS, valid SW + manifest, not already installed). It does **not** fire on iOS. Zyra always shows a helpful tip/instructions so install isn’t blocked on that event alone.

### DevTools check

1. Application → Manifest (icons + start_url OK)
2. Application → Service Workers (`/sw.js` activated)
3. Lighthouse → PWA / Installable
4. Ensure `/sw.js` is not HTML (middleware must skip it)
