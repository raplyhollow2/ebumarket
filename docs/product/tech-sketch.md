# Tech Sketch (Pre-Implementation)

Not a commitment — a starting proposal for a fast usability prototype.

## Recommended direction

**Next.js (App Router) + TypeScript + local/seed data** for a single deployable web MVP.

| Concern | Suggestion |
| --- | --- |
| UI | React + CSS modules or Tailwind; mobile-first |
| State | React context or Zustand; persist to `localStorage` for sessions |
| Auth | Mock auth with roles: `user` \| `admin` (+ optional `org`) |
| Images | Client-side File → object URL; optional compress |
| Hosting | Vercel / static export if fully client-side |

Alternative: Vite + React SPA if no SSR needed.

## Logical data model

```text
User { id, displayName, email, role, location, meetupPoints[] }
Listing {
  id, type: 'marketplace' | 'donation',
  sellerId, title, description, category, size, condition,
  price | null, photos: { angle, url }[],
  status: pending | verified | rejected | sold | claimed | closed,
  rejectReason?
}
Transaction {
  id, listingId, buyerId, sellerId,
  paymentMethod: 'cod' | 'online',
  itemPrice, fee, total, status
}
DonationClaim {
  id, listingId, claimerId, message, contact,
  pickupPreference, status
}
```

## Route sketch

```text
/                    Home
/signup /login
/market              Browse
/market/new          Sell flow
/market/[id]         Detail + buy
/donate              Hub browse
/donate/new
/donate/[id]         Detail + claim
/activity
/profile
/profile/location
/admin               Queue
/admin/listings/[id]
/admin/transactions
```

## Seed data for research

- 6–8 verified marketplace items  
- 2–3 pending items (for admin task)  
- 4 donation items  
- Demo users: Maya (seller), Jordan (buyer), Sam (donor), Alex (admin)  
- Research **role switcher** in a non-intrusive footer/dev panel  

## Analytics (lightweight)

For engagement analysis during tests:

- Event stubs: `view_item`, `start_sell`, `submit_listing`, `verify_listing`, `start_checkout`, `select_payment`, `submit_claim`  
- Log to console or local event array exportable as JSON after session  

## Security note

Prototype ≠ production. No real PII storage commitments; use fake accounts in tests.
