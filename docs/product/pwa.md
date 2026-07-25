# Progressive Web App (PWA)

Zyra installs as a standalone app on mobile/desktop.

## What’s included

| Piece | Path |
| --- | --- |
| Web app manifest | `src/app/manifest.ts` → `/manifest.webmanifest` |
| Service worker | `public/sw.js` |
| Icons | `public/icons/*` |
| Install helpers | `src/lib/pwa-install.ts` |
| Install banner | `src/components/pwa/ServiceWorkerRegister.tsx` |
| Profile install card | `src/components/pwa/InstallPwaCard.tsx` |
| Meta / theme | `src/app/layout.tsx` (`appleWebApp`, `themeColor`, icons) |

## Behaviour

- **display:** `standalone`
- **theme / background:** forest `#1c3024` / cream `#f7f4ef`
- **Cache:** shell + `/bhutan/*` + `/_next/static/*` (stale-while-revalidate)
- **Navigations:** network-first, fall back to cached `/`
- **Never cached:** `/api/*`, checkout paths
- **SW registration** always runs, even if the tip was dismissed

## Install

1. Deploy over **HTTPS** (required except `localhost`)
2. Open the site — within ~1s the install chip appears above the bottom nav:
   - **Android Chrome:** Install button when the browser fires `beforeinstallprompt`
   - **iPhone Safari:** Share → Add to Home Screen
   - **Fallback tip:** Chrome ⋮ → Install app
3. **Profile → Install Zyra app** always works without reload (Install / Show tip)
4. If you dismissed the tip, it reappears after 3 days — or tap **Show tip** on Profile

### Why the Chrome Install button sometimes doesn’t appear

`beforeinstallprompt` only fires when Chrome decides the app is installable (HTTPS, valid SW + manifest, not already installed, engagement heuristics). It does **not** fire on iOS. Zyra always shows a tip/instructions and a Profile install card so install isn’t blocked on that event alone.

### DevTools check

1. Application → Manifest (icons + start_url OK)
2. Application → Service Workers (`/sw.js` activated)
3. Lighthouse → PWA / Installable
4. Ensure `/sw.js` is not HTML (middleware must skip it)
5. Clear `localStorage.zyra-pwa-dismissed` if the tip was dismissed
