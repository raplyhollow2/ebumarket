# Wireframes (Low-Fidelity)

Structure only. Implementation uses **shadcn** Sheets, Badges, Forms — see [ui-system.md](../product/ui-system.md).

Conventions: `[ ]` button · `( )` input · `{badge}` · `···` scroll

---

## 1. Home (first viewport)

```text
┌─────────────────────────────┐
│  ZYRA                       │  ← brand as hero
│  Clothes that get           │
│  a second life.             │
│                             │
│  Teen marketplace +         │
│  free donation hub.         │
│                             │
│  [ Shop Market ]            │
│  [ Donate / Claim ]         │
│                             │
│  ═══════════════════════    │  ← full-bleed fashion visual
└─────────────────────────────┘
Tab: Home · Market · Donate · Activity · Profile
```

Budget: brand, one headline, one support line, one CTA group, one dominant visual.

---

## 2. Auth Sheet (moment of need)

```text
┌─────────────────────────────┐
│  Create your Zyra      [x]  │
│  (display name)             │
│  (email)                    │
│  (password)                 │
│  [ ] I confirm I’m 13+      │
│  Note: under 16 — ask a     │
│  parent/guardian if unsure  │
│  (area / neighborhood)      │
│  (meetup spot optional)     │
│  [ Sign up ]  Log in        │
└─────────────────────────────┘
```

---

## 3. Market browse

```text
┌─────────────────────────────┐
│  Market          (search)   │
│  Filter: size · category    │
│  ┌────┐ ┌────┐              │
│  │pic │ │pic │              │
│  │$12 │ │$8  │  {V}         │
│  └────┘ └────┘              │
│  [ + Sell an item ]         │
└─────────────────────────────┘
```

Only **verified** items. `{V}` = Verified by Zyra.

---

## 4. Item detail + Buy Sheet

```text
┌─────────────────────────────┐
│  ←  Photo carousel ···      │
│  Denim jacket               │
│  {Verified by Zyra}         │
│  Size M · Good · Northside  │
│  [ Buy ]                    │
└─────────────────────────────┘

Buy Sheet (slides up):
┌─────────────────────────────┐
│  Price breakdown            │
│  Item          $20.00       │
│  Platform fee   $1.00       │
│  Total         $21.00       │
│  (•) COD  ( ) Online        │
│  Meetup: Mall food court ▾  │
│  [ Confirm ]                │
└─────────────────────────────┘
```

Online → Stripe Checkout (test); return to Activity with live status.

---

## 5. Sell composer (single screen)

```text
┌─────────────────────────────┐
│  Sell an item               │
│  (title) (category) (size)  │
│  (condition) (price)        │
│  (description)              │
│  Photos (required)          │
│  [Front] [Back] [Tag] [Def] │
│  (+ More)                   │
│  ···                        │
│  [ Submit for verification ]│  ← sticky
└─────────────────────────────┘
```

Success → toast + Activity shows `{Pending Verification}`.

---

## 6. Donation browse + Claim Sheet

```text
┌─────────────────────────────┐
│  Donation Hub               │
│  Free clothes near you      │
│  ┌────┐ ┌────┐              │
│  │free│ │free│              │
│  └────┘ └────┘              │
│  [ List a donation ]        │
└─────────────────────────────┘

Claim Sheet:
│  (message) (contact)        │
│  (pickup preference)        │
│  [ ] Claiming as org        │
│  [ Send request ]           │
```

Donate composer mirrors sell (no price).

---

## 7. Activity (unified)

```text
┌─────────────────────────────┐
│  Activity                   │
│  [ All ] [ Selling ] [ Buys ]│
│  [ Claims ]                 │
│  • Jacket  {Pending}        │
│  • Hoodie  {Verified}       │
│  • Buy COD {Requested}      │
│  • Claim   {Approve?}       │
└─────────────────────────────┘
```

---

## 8. Profile + meetups

```text
┌─────────────────────────────┐
│  Profile                    │
│  Display name · area        │
│  Meetup spots               │
│  • Mall food court    [x]   │
│  (+ Add spot)               │
│  [ Log out ]                │
└─────────────────────────────┘
```

---

## 9. Admin — inline queue

```text
┌─────────────────────────────┐
│  Admin · Verification       │
│  Pending (12)               │
│  ┌───────────────────────┐  │
│  │ thumbs: F B T D       │  │
│  │ Denim jacket · Maya   │  │
│  │ [ Verify ] [ Reject ] │  │
│  └───────────────────────┘  │
│  ··· next rows              │
└─────────────────────────────┘
```

Reject → AlertDialog for reason. No mandatory detail page for approve.

---

## 10. Admin — transactions

```text
┌─────────────────────────────┐
│  Transactions               │
│  Filter: all / COD / online │
│  DataTable: item · parties  │
│  method · status · total    │
└─────────────────────────────┘
```

---

## Notes

- Stacked mobile layouts; desktop = wider max-width, same structure  
- Cards only for tappable listing tiles  
- Badge adjacent to title on detail  
- All actions persist to Supabase (see [data-model.md](../product/data-model.md))
