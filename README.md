# ⏱ SHOTCLOCK v0.01: domains on the clock

A **live, countdown-driven quick-sale marketplace for domain names**, inspired by OpenSea, Magic Eden and Tensor, built for FOMO, urgency and fast deals in the domain trenches.

Domain investors sit on hundreds of names across GoDaddy, Namecheap, Dynadot, Unstoppable Domains and others, and many of them expire because renewals add up. SHOTCLOCK puts every name on a visible shot clock (time to expiry, or the estimated end of its grace or redemption window), prices it with a transparent heuristic, bundles the long tail into lots, and lets buyers bid before the clock runs out.

> **v0.01 is a front-end prototype.** Prices are indicative heuristics, **not appraisals**. Offers, bids and purchases are **simulated**, and there are no payments, escrow, transfers or accounts. Visitor activity lives in the browser's `localStorage`. Listings are a real portfolio; any auto-generated offers or bids are labeled **DEMO DATA**.

## Features

| Area | What ships in v0.01 |
| --- | --- |
| **Shot Clock** (`/shotclock`) | Every live name and lot sorted by soonest deadline, with live relative countdowns (`3d 04:12:09`) and urgency tiers: REDEMPTION, GRACE, ≤7 DAYS, ≤30 DAYS, ≤90 DAYS, 90+ DAYS. It never shows wall-clock times or time zones. |
| **Live inventory** | Real names seeded as live listings from `src/data/inventory.ts` (domain, registrar and expiry only), priced at `max(mid, 2 × instant buyout)`; families become quick-sale lots priced at 1.2 × summed buyout. |
| **Marketplace** (`/market`) | Dark NFT-style grid with countdown on every card, collections by TLD with floor prices, stats, filters (search, TLD, category, type, price, length, on-the-clock, sold), sorting (shot clock first by default), listing modal with **Buy now / Place bid / Make offer** and an activity feed. |
| **Upload & value** (`/upload`) | Paste a list or upload a CSV/TSV (`domain, registrar, expiry, cost_basis`). Registrar is normalized to GoDaddy / Namecheap / Dynadot / Unstoppable / Other. Includes a preview with valuations and totals, plus a single-name quick check. |
| **Indicative valuation** | Deterministic engine (length, TLD tier, dictionary words / brandability, hyphens / digits, hot keywords, expiry urgency) that returns a low/high range, a 0–100 score, an **instant pawn** quote (LTV %) and an **instant buyout** price, with a full factor breakdown. |
| **Bundles** (`/bundles`) | Auto-grouped suggestions by category, price tier, TLD or length; custom bundles; list a lot. |
| **DOU DIGITAL teaser** (`/dou` + home) | Coming-soon section for the DOU DIGITAL creator ecosystem, with a waitlist form (v0.01 saves it in the browser only). DOU brand names are kept off the sale floor. |
| **Seller dashboard** (`/dashboard`) | Portfolio table, expiring-soon alerts, bulk list (each listing gets a 7-day sale clock), offers received with accept / decline, delist, my bids, and reset. |

## Urgency model

```
days = expiry − now
REDEMPTION  31–60 days past expiry (est.)   clock → expiry + 60d ("drops in")
GRACE       1–30 days past expiry (est.)    clock → expiry + 30d ("grace ends in")
≤7 / ≤30 / ≤90 DAYS                          clock → expiry ("expires in")
90+ DAYS                                     clock → expiry
User listings                                clock → listed + 7d ("sale ends in")
```

Grace and redemption windows vary by registrar. These are typical-case estimates.

## Valuation heuristic

```
value = lengthBase × tldMultiplier × wordFactor × hyphen/digit factors × hotKeyword
low   = 0.6 × value      high = 1.6 × value     (rounded to friendly numbers)
pawn  = low × LTV        LTV: 30% normal · 22% ≤60d · 15% ≤14d · 10% expired (+5% if score ≥ 70)
buyout= low × 55% / 48% / 40% / 30% on the same urgency scale
```

- **Length base:** 2 chars $25k · 3 $6k · 4 $1.8k · 5 $900 · 6 $500 · 7 $320 · 8 $220 · 9–10 $140 · 11–14 $70 · 15+ $25
- **TLD:** .com ×1 · .ai ×0.8 · .io ×0.55 · .co ×0.45 · .net/.org/.app ×0.35 · .dev/.gg/.eth ×0.3 · .crypto ×0.25 · other Web3 ×0.12–0.2 · long-tail ×0.1
- **Words** (built-in dictionary with simple plurals): single word ×3 · two words ×1.8 · three words ×1.2 · pronounceable brandable ×1.3 · awkward ×0.4
- **Penalties/premiums:** 1 hyphen ×0.4, 2+ ×0.2 · mixed digits ×0.5 · short all-numeric ×1.5 · hot keyword ×1.25

Source: [`src/lib/valuation.ts`](src/lib/valuation.ts), [`src/lib/shotclock.ts`](src/lib/shotclock.ts).

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- No backend, database or auth: `localStorage` only (`src/lib/store.ts`)
- All routes are statically prerendered

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Project layout

```
src/app/              routes: / · /shotclock · /market · /upload · /bundles · /dashboard · /dou
src/components/       UI (ShotClock, Countdown, DouTeaser, Marketplace, Upload, Bundles, Dashboard, ListingModal, …)
src/data/inventory.ts live inventory (domain, registrar, expiry) and quick-sale lots
src/lib/valuation.ts  deterministic valuation engine
src/lib/shotclock.ts  urgency tiers, deadlines, countdown formatting
src/lib/csv.ts        portfolio parser (CSV/TSV/plain list)
src/lib/seed.ts       seeds live listings and lots; simulated bids are labeled demo data
src/lib/store.ts      localStorage store and actions
ONESHOT.md            single prompt to regenerate this app with any AI coding tool
```

## Roadmap

- **v0.02, accounts and real bids:** auth (email / wallet), server-side listings and offers, real-time bid alerts, timed auctions with anti-snipe extensions.
- **v0.03, registrar APIs:** import from GoDaddy, Namecheap, Dynadot and Unstoppable Domains; ownership verification (DNS TXT / API); live expiry and grace/redemption status sync.
- **v0.04, escrow and payments:** escrow partner, Stripe / USDC settlement, push-transfer and auth-code workflows, buyer-pays-renewal for expired names.
- **v0.05, pawn loans:** collateralized short-term loans with redemption windows and auto-renew from proceeds.
- **v0.06, on-chain domains:** list and settle ENS / Unstoppable / tokenized names natively, with wallet connect and on-chain offers.
- **Live shopping:** scheduled drops, streamed sale rooms, a sweep-the-floor feature, keyword/TLD alerts, and pricing signals beyond the heuristic.

## Disclaimer

Prototype for demonstration. Nothing here is an appraisal, financial advice, or a binding offer to buy, sell or lend.
