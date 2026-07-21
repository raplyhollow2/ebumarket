# Usability Research Plan

## Research questions

1. Can teens complete sell → verify → buy without facilitator rescue?  
2. Do users **notice** and correctly **interpret** Pending vs Verified badges?  
3. Is payment method choice + price breakdown clear before commit?  
4. Is Donation Hub claim flow understandable for teens and org flag?  
5. Where do users hesitate, mis-tap, or abandon?  
6. Do low-friction patterns (composer / Buy Sheet) feel faster than expected marketplaces?

## Method

- **Moderated** usability sessions, phone or narrow browser  
- Think-aloud  
- Post-task SEQ + short trust Likert  
- Optional: event log from live app  

**Sample:** 5–8 teens + 1–2 team members on admin path (Alex seed account).

## Session outline (~30–40 min)

| Block | Time | Activity |
| --- | --- | --- |
| Intro | 5m | Consent; “Stripe test / not real money” |
| Tasks | 20m | Scripted tasks below |
| Debrief | 10m | Trust + preference questions |

## Scripted tasks

| ID | Task | Success |
| --- | --- | --- |
| T1 | Create account and add one meetup point | Rows in `profiles` + `meetup_points` |
| T2 | List a marketplace item with all required photo angles | Listing `pending` in Supabase |
| T3 | (Admin Alex) Verify that listing | Item appears in Market as Verified |
| T4 | Buy with COD; explain total before confirm | Correct method + can state total; `transactions` row |
| T5 | List or claim a donation | Claim or listing created live |

Use **real seeded accounts** (Maya / Jordan / Sam / Alex). Do not use a fake client-only role switcher.

## Measures

### Behavioral

- Task completion, time on task, errors  
- Whether badge was mentioned unprompted  
- Taps to complete sell submit / buy confirm  

### Self-report

- SEQ (1–7)  
- Trust: “I would trust buying a Verified by Zyra item” (1–5)  
- Clarity: “I understood Pending Verification” (1–5)  
- Preference: Market vs Donate ease  

### Engagement proxies

- Funnels: start_sell → submit_listing; view_item → select_payment → confirm  
- Donation: view → claim submit  

## What we will change after research

1. Badge wording/placement  
2. Sell photo friction  
3. Checkout breakdown comprehension  
4. Donation claim language (teen vs org)  
5. Sheet vs page affordances  

## Facilitator checklist

- [ ] Re-seed / reset Supabase demo data between participants  
- [ ] Phone-width viewport  
- [ ] Note exact quotes on trust  
- [ ] Stripe test mode keys configured  
- [ ] Export event log if enabled  
