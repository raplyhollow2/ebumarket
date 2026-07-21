# Zyra

Teen-focused **circular fashion** platform: Peer-to-Peer Marketplace + Donation Hub, with admin verification for trust.

## Current phase

**Drawing board & documentation** — product, flows, wireframes, **live Supabase** stack, shadcn UI system, and usability plan. App code follows these docs.

→ Start at **[docs/README.md](./docs/README.md)**  
→ Locked decisions: **[docs/drawing-board/00-index.md](./docs/drawing-board/00-index.md)**  
→ Stack: **[docs/product/tech-sketch.md](./docs/product/tech-sketch.md)**

## Stack (locked)

- **Next.js** + TypeScript + **shadcn/ui**  
- **Supabase** (Postgres + Auth + Storage + RLS) — all live data  
- **Stripe test mode** for online payments  

Env placeholders: [`.env.example`](./.env.example) (never commit real secrets).

## What’s next

1. `supabase link` + migrations from [data-model.md](./docs/product/data-model.md)  
2. Build MVP slices in [mvp-scope.md](./docs/product/mvp-scope.md)  
3. Run usability sessions per [usability-plan.md](./docs/research/usability-plan.md)  

## Repo

Formerly placeholder `ebumarket`; product is **Zyra**.
