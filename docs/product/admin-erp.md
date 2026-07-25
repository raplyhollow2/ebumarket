# Admin ERP — Running Zyra

The Admin ERP is the **operations control plane** for the live site: verification, money, content, experiments, users, and settings. It must be complete enough to run day-to-day marketplace ops on **mobile and desktop**.

## Purpose

| Goal | Module |
| --- | --- |
| Trust | Approval queue — verify / reject listings |
| Money | Transactions — COD, online, seller payouts |
| Content | CMS — homepage heroes, content blocks |
| Growth | A/B experiments — variant assignment & metrics |
| Insight | Dashboard / analytics — live counters |
| People | Settings — users, approvers, roles flags |
| Platform | Settings — currency (BTN), fee % |

## Canonical routes (all required)

| Route | Role | Notes |
| --- | --- | --- |
| `/admin` | Approver+ | Pending verification queue (primary daily tool) |
| `/admin/dashboard` | Admin | ERP overview + module launcher |
| `/admin/centers` | Admin | Orphanages/centres CRUD + staff (`center_members`) |
| `/admin/transactions` | Admin | Ledger, payout mark paid-out |
| `/admin/cms` | Admin | Hero builder, activate live homepage hero |
| `/admin/experiments` | Admin | Create / start / pause A/B experiments |
| `/admin/analytics` | Admin | Analytics dashboard |
| `/admin/settings` | Admin | Currency, fee %, users & `can_approve` |

Shared chrome: `AdminShell` — responsive top/side nav so every module is one tap away on phone.

## Access model

1. **Legacy admin:** `profiles.role = 'admin'` — full ERP  
2. **Approver:** `can_approve` — queue (+ limited paths)  
3. **RBAC (optional):** `admin_roles` / `admin_role_assignments` for CMS/analytics permissions  

CMS and experiments also allow legacy admins via `is_legacy_admin()` policies.

## Money flow (ERP must support)

```text
Buyer pays Zyra (item + fee)
  → fee retained by platform
  → seller_payout claimable → seller claims in Activity
  → admin marks paid_out in Transactions
```

COD: meetup cash — payout `not_applicable`.

## Optimization rules

1. **Queue first** — `/admin` loads pending items fast; filters/history stay usable on narrow screens.  
2. **One shell** — do not invent per-page nav; use `AdminShell`.  
3. **Live stats** — dashboard counts from Supabase (`pending`, users, verified listings, events).  
4. **Mobile parity** — tables scroll horizontally; primary actions stay sticky/thumb-reachable.  
5. **Audit** — verify/reject and CMS mutations write audit rows when available.

## Out of scope for ERP (for now)

- Stripe Connect automatic bank payouts  
- Full customer-support ticketing  
- Native push ops console  

## Acceptance — “ERP can run the website”

- [ ] Approver verifies a listing from phone  
- [ ] Admin activates a CMS hero; homepage updates  
- [ ] Admin starts an A/B experiment  
- [ ] Admin reviews transaction split + marks seller paid out  
- [ ] Admin changes fee % / currency and grants `can_approve`  
- [ ] Dashboard shows non-zero live counts after seed traffic  

## Related

- [mvp-scope.md](./mvp-scope.md)  
- [mobile-desktop-parity.md](./mobile-desktop-parity.md)  
- [../research/marketplace-payment-model.md](../research/marketplace-payment-model.md)  
