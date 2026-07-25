# Phased implementation roadmap

**Do not estimate calendar time** — phases are technical slices.

---

## Phase 0 — Documentation — done

## Phase 1 — Centre ops gaps — done

## Phase 1.5 / 2.3 — Live image Storage — done

## Phase 2 — Staff ops + polish

| # | Work | Status |
| --- | --- | --- |
| 2.1 | Activity “Centres” tab for `center_members` | Done |
| 2.2 | RLS for centre staff on tagged listings/claims | Done |
| 2.3 | profile-media / center-media uploads | Done |
| 2.4 | Admin verify toast with points | Done (admin path) |
| 2.5 | Remove mock donation components | Done |
| 2.6 | Document deferred social/messaging APIs | Done (`deferred-apis.md`) |

**Also this pass:** single-tree shells, token sweep on live chrome + cards + sheets.

## Phase 3 — Product expansions

| # | Work | Status |
| --- | --- | --- |
| 3.1 | Money donations to centres | Deferred |
| 3.2 | Centre self-signup + KYC | Deferred |
| 3.3 | Tumblr scrapbook/posts | Deferred |
| 3.4 | Push/email on tier-up | Deferred |
| 3.5 | Public leaderboard | Done (`/donate/leaderboard`) |

## Phase 4 — Hardening

| # | Work | Status |
| --- | --- | --- |
| 4.1 | Auth on admin dashboard-stats | Done; rate limits deferred |
| 4.2 | Theme image URL https-only sanitize | Done (basic) |
| 4.3 | Observability on donor_stats | Deferred |
| 4.4 | Full E2E suite | Deferred |

## Current pointer

**Clothes + centres MVP:** production-capable — see [production-readiness.md](./production-readiness.md)  
**Branch:** `cursor/remaining-phase-134f` · **PR:** #8
