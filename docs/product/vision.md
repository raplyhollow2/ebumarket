# Product Vision — Zyra

## One-liner

**Zyra** helps teens reuse clothes locally through a trusted peer marketplace and a free donation hub.

## Problem

Teens outgrow clothes quickly, buy fast fashion, and lack a safe, age-appropriate way to sell, swap, or give items locally. Existing marketplaces feel adult-oriented, trust is unclear (fake photos, scams), and donation often means “bag it and hope.”

## Solution

A mobile-friendly web app with:

1. **Peer-to-Peer Marketplace** — multi-angle photos, admin verification, COD or online pay, clear fee/price breakdown  
2. **Donation Hub** — free items; teens or orgs request/claim  
3. **Admin control panel** — verify listings, track statuses and transactions  

All of the above runs on **live Supabase data** (not a disposable client mock).

## Goals (MVP)

| Goal | How we’ll know |
| --- | --- |
| Usability | Teens complete core tasks without facilitator help |
| Trust | Users notice and understand “Pending” vs “Verified by Zyra” |
| Engagement | Clear preference / ease scores for Marketplace vs Donation Hub |
| Clarity | Payment method + price breakdown understood before “confirm” |
| Efficiency | Sell/buy paths meet click-count targets in interaction principles |

## Non-goals (this phase)

- Full logistics / shipping network  
- Production payment settlement, payouts, or KYC (Stripe **test mode** only)  
- Social feed / DMs as a product surface  
- Custom design system beyond **shadcn/ui** + brand direction  

## Design principles

1. **Trust is visible** — verification state is never buried  
2. **Fewer clicks, more done** — composers and sheets over wizards  
3. **Teen-clear language** — no marketplace jargon  
4. **Reuse over clutter** — circular fashion is the story, not a badge farm  
5. **Meetup-aware** — location/meetup setup supports COD safely  
6. **Live and shared** — what you submit is what others and admins see  

## Brand / product signal

- Name **Zyra** should read as the hero identity on first viewport of home  
- Avoid generic “dashboard” feel on consumer surfaces  
- Atmosphere: circular fashion / secondhand culture (real clothing context), not abstract purple SaaS
