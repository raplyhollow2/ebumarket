# Wireframes (Low-Fidelity)

ASCII layouts for structure only. Not final visual design.

Conventions: `[ ]` button · `( )` input · `{badge}` status · `···` scroll

---

## 1. Welcome / Home (first viewport)

```text
┌─────────────────────────────┐
│  ZYRA                       │  ← brand as hero signal
│  Clothes that get           │
│  a second life.             │
│                             │
│  Teen marketplace +         │
│  free donation hub.         │
│                             │
│  [ Shop Market ]            │
│  [ Donate / Claim ]         │
│                             │
│  ═══════════════════════    │  ← full-bleed fashion visual plane
│  (atmosphere: real clothes) │
└─────────────────────────────┘
Tab: Home · Market · Donate · Activity · Profile
```

**Budget:** brand, one headline, one support line, one CTA group, one dominant visual. No stats row.

---

## 2. Sign up

```text
┌─────────────────────────────┐
│  Create your Zyra           │
│  (display name)             │
│  (email / username)         │
│  (password)                 │
│  [ ] I confirm I’m 13+      │
│  [ Sign up ]                │
│  Log in link                │
└─────────────────────────────┘
```

---

## 3. Location & meetup points

```text
┌─────────────────────────────┐
│  Your area                  │
│  (City / neighborhood)      │
│                             │
│  Meetup spots (optional)    │
│  • Mall food court    [x]   │
│  • Library steps      [x]   │
│  (+ Add spot)               │
│  [ Save ]                   │
└─────────────────────────────┘
```

---

## 4. Market browse

```text
┌─────────────────────────────┐
│  Market          (search)   │
│  Filter: size · category    │
│  ┌────┐ ┌────┐              │
│  │pic │ │pic │              │
│  │$12 │ │$8  │              │
│  │{V} │ │{V} │              │
│  └────┘ └────┘              │
│  [ + Sell an item ]         │
└─────────────────────────────┘
```

`{V}` = Verified by Zyra (only live items shown to buyers).

---

## 5. Item detail (marketplace)

```text
┌─────────────────────────────┐
│  ←  Photo carousel ···      │
│  angles: Front Back Tag …   │
│                             │
│  Denim jacket               │
│  {Verified by Zyra}         │
│  Size M · Good condition    │
│  Meetup area: Northside     │
│                             │
│  Price breakdown            │
│  Item          $20.00       │
│  Platform fee   $1.00       │
│  Total         $21.00       │
│                             │
│  Pay with:                  │
│  (•) Cash on Delivery       │
│  ( ) Online Transaction     │
│  [ Continue ]               │
└─────────────────────────────┘
```

Pending (seller view only):

```text
│  {Pending Verification}     │
│  Buyers can’t see this yet. │
```

---

## 6. Sell flow — photos

```text
┌─────────────────────────────┐
│  Photos (required angles)   │
│  [Front ] [Back  ]          │
│  [Tag   ] [Defect]          │
│  (+ More photos)            │
│  [ Continue ]               │
└─────────────────────────────┘
```

---

## 7. Sell — submitted

```text
┌─────────────────────────────┐
│  Sent for verification      │
│  {Pending Verification}     │
│  We’ll notify you when      │
│  it’s Verified by Zyra.     │
│  [ Back to Activity ]       │
└─────────────────────────────┘
```

---

## 8. Donation Hub browse

```text
┌─────────────────────────────┐
│  Donation Hub               │
│  Free clothes near you      │
│  ┌────┐ ┌────┐              │
│  │free│ │free│              │
│  └────┘ └────┘              │
│  [ List a donation ]        │
└─────────────────────────────┘
```

---

## 9. Claim / request

```text
┌─────────────────────────────┐
│  Request this donation      │
│  (Who are you? teen / org)  │
│  (Message)                  │
│  (Contact)                  │
│  (Preferred pickup)         │
│  [ Send request ]           │
└─────────────────────────────┘
```

---

## 10. Admin — verification queue

```text
┌─────────────────────────────┐
│  Admin · Verification       │
│  Pending (12)               │
│  • Denim jacket  Maya  [>]  │
│  • Hoodie        Sam   [>]  │
└─────────────────────────────┘

Detail:
│  All angles grid            │
│  Listing fields             │
│  [ Verify ]  [ Reject ]     │
│  (rejection note)              │
└─────────────────────────────┘
```

---

## 11. Admin — transactions board

```text
┌─────────────────────────────┐
│  Transactions               │
│  Filter: all / COD / online │
│  Item · parties · method ·  │
│  status · total             │
└─────────────────────────────┘
```

---

## Prototype notes

- Prefer stacked single-column mobile layouts; desktop = same structure, wider max-width  
- Cards only where they wrap a tappable listing tile (browse grids)  
- Verification badge always adjacent to title on item detail
