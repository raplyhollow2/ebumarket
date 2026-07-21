# MVP Scope

Prototype goal: **interactive web MVP** for usability testing — not production launch.

## In scope

### Accounts & profile

- Sign up / log in (simple auth; local or mock OK)  
- Profile with display name  
- Location (general area) + meetup points CRUD  

### Marketplace

- Create listing: title, category, size, condition, price, description  
- Multi-angle photo upload (required set + optional extras)  
- Listing enters **pending**; public Market shows **verified** only  
- Item detail: carousel, **Pending / Verified** badge, price breakdown  
- Buy path: COD or Online (online = simulated)  
- Activity: my listings + my transactions  

### Donation Hub

- Create donation listing (photos + basic details, price = free)  
- Browse + detail  
- Claim/request flow with message + contact + pickup preference  
- Donor sees incoming requests (approve/decline minimal)  

### Admin

- Verification queue with photo review  
- Approve → verified / Reject → reason  
- Transactions & item status overview  

### UX shell

- Mobile-friendly layout  
- Bottom nav for teen app surfaces  
- Seed/demo data for testing sessions  

## Out of scope (MVP)

- Real payment processor / payouts  
- Shipping labels & logistics  
- Push notifications / email provider (in-app toasts enough)  
- Advanced search/recommendations  
- Full messaging/chat product  
- Native mobile apps  
- Complex org verification KYC  

## Prototype fidelity

| Layer | Approach |
| --- | --- |
| UI | Clean, teen-friendly; enough polish for trust testing |
| Data | Client store + seed JSON, or lightweight backend |
| Auth | Simple session; role switcher helpful for research (User / Admin) |
| Photos | File input → local preview / object URLs |

## Build slices (implementation order)

1. Shell + auth + profile/location  
2. Marketplace list/detail + sell + pending states  
3. Admin verify queue  
4. Checkout COD/online + breakdown  
5. Donation hub + claims  
6. Activity + admin transactions board  
7. Seed data + research role switcher  

## Acceptance for “ready to test”

- Facilitator can run the 5 scripted tasks in [flows/user-flows.md](../flows/user-flows.md) without broken paths  
- Badges and price breakdown visible without hunting  
- Works on a phone-width viewport
