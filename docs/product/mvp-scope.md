# MVP Scope

Goal: **interactive web MVP on live Supabase data** for usability testing — not a client-only mock.

## In scope

### Accounts & profile

- Supabase Auth sign up / log in (Auth Sheet)  
- Profile: display name, area, meetup points CRUD  
- Roles: `user` | `admin`; `is_organization` flag  

### Marketplace

- Single-screen sell composer (details + required photo angles + price)  
- Uploads → Supabase Storage + `listing_photos`  
- Listing enters **pending**; public Market shows **verified** only  
- Detail + Buy Sheet: COD or Stripe test online; **split fee breakdown** (buyer → platform, 5% keep, seller payout)  
- Public buyer/seller profiles (`/profile/[id]`) linked from listings & Activity  
- Activity: live listings + **incoming buy requests for sellers** + payout claim  
- Split ledger: `fee_cents` / `seller_payout_cents` / `payout_status`; admin mark paid out 

### Donation Hub

- Single-screen donate composer  
- Browse + Claim Sheet  
- Donor approve/decline claims in Activity  
- Same verification queue as marketplace  

### Admin

- Inline verification queue (Approve / Reject + reason)  
- Transactions DataTable  
- Audit events on verify/reject  

### Platform

- Next.js + TypeScript + Tailwind + **shadcn/ui**  
- All reads/writes against **Supabase Postgres**  
- Seed script into live DB for research personas  
- Mobile-friendly teen shell + admin layout  

## Out of scope (MVP)

- Production Stripe live mode / Connect KYC / automatic bank payouts (MVP uses claim + admin paid-out ledger) 
- Shipping labels & logistics  
- Push / email provider (in-app toasts enough)  
- Advanced search / recommendations  
- Full messaging / chat product  
- Native mobile apps  
- Complex org KYC  

## Fidelity

| Layer | Approach |
| --- | --- |
| UI | shadcn + teen-friendly polish for trust testing |
| Data | **Live Supabase only** (seed = bootstrap) |
| Auth | Supabase Auth + real admin seed user |
| Photos | Supabase Storage |
| Payments | Stripe **test mode** + webhooks |

## Build slices

1. Supabase link + migrations + RLS + seed  
2. Shell + Auth Sheet + profile/meetups  
3. Market browse/detail + sell composer + pending  
4. Admin inline verify  
5. Buy Sheet + COD + Stripe test  
6. Donation composer + claim Sheet  
7. Activity + admin transactions  

## Acceptance — ready to test

- Facilitator runs T1–T5 in [user-flows.md](../flows/user-flows.md) on **live** data  
- Second browser/user sees verified items and activity updates without refresh hacks beyond normal revalidation  
- Badges + price breakdown visible without hunting  
- Phone-width viewport works  
- No dependency on localStorage as database  
