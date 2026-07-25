# Deferred API surfaces (no App Router pages yet)

These APIs exist under `src/app/api/**` but have **no** first-class teen pages. Components under `src/components/social|messaging|boost` are unused by `src/app/**/page.tsx`.

| API area | Routes | Status |
| --- | --- | --- |
| Messaging | `/api/messaging/conversations`, `/api/messaging/messages` | API only |
| Social | `/api/social/likes`, `follows`, `comments` | Partial use via listing like handlers; no inbox UI |
| Offers | `/api/offers` | API only |
| Boost | `/api/boost` | API only |
| AI | `/api/ai/*` | Partial / mock |

**Product rule:** Do not link these from nav until a page ships on **both** mobile and desktop shells.

When shipping, add a row to [../product/mobile-desktop-parity.md](../product/mobile-desktop-parity.md).
