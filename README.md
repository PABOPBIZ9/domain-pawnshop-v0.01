# PAWN.DOMAINS — Domain Pawnshop v0.01

An **instant-liquidity marketplace for domain names**, inspired by OpenSea, Magic Eden and Tensor.

Domain investors sit on hundreds of names spread across GoDaddy, Namecheap, Dynadot, Unstoppable Domains and others — many of them expiring because renewals add up. Domain Pawnshop is a prototype of a faster path from *holding* domains to *realizing their value*: upload a portfolio, get indicative valuations, bundle the long tail, and sell to investors, resellers and end users through quick bids.

> **v0.01 is a front-end prototype.** Valuations are a transparent heuristic, **not appraisals**. There are no real payments, escrow, transfers or accounts. All data lives in your browser's `localStorage`. Seeded listings and simulated offers are labeled **demo data**.

## Features

| Area | What ships in v0.01 |
| --- | --- |
| **Portfolio upload** | Paste a list or upload a CSV/TSV (`domain, registrar, expiry, cost_basis`). Registrar normalized to GoDaddy / Namecheap / Dynadot / Unstoppable / Other. Header optional, plain one-per-line lists work too. Sample + downloadable template. |
| **Indicative valuation** | Deterministic engine (length, TLD tier, dictionary words / brandability, hyphens / digits, hot keywords, expiry urgency) → low/high range, 0–100 score, **instant pawn offer** (loan-to-value %) and **instant buyout** price, with a full factor breakdown. |
| **Bundles** | Auto-grouped suggestions by category, price tier, TLD or length; hand-pick custom bundles; list a bundle as a single lot. |
| **Marketplace** | Dark NFT-style grid, collections by TLD with floor prices, stats (floor, listed, volume, open/top offers), filters (search, TLD, category, type, price, length, expiring soon, sold), sort, listing modal with **Buy now / Place bid / Make offer**, activity feed. |
| **Seller dashboard** | Portfolio table with valuations, bulk list at suggested prices, expiring-soon alerts, offers received with accept / decline, my listings (delist), my bids. Reset button re-seeds demo data. |

## Valuation heuristic (v0.01)

```
value = lengthBase × tldMultiplier × wordFactor × hyphen/digit factors × hotKeyword
low   = 0.6 × value      high = 1.6 × value     (rounded to friendly numbers)
pawn  = low × LTV        LTV: 30% normal · 22% ≤60d to expiry · 15% ≤14d · 10% expired (+5% if score ≥ 70)
buyout= low × 55% / 48% / 40% / 30% on the same urgency scale
```

- **Length base:** 2 chars $25k · 3 $6k · 4 $1.8k · 5 $900 · 6 $500 · 7 $320 · 8 $220 · 9–10 $140 · 11–14 $70 · 15+ $25
- **TLD:** .com ×1 · .ai ×0.8 · .io ×0.55 · .co ×0.45 · .net/.org/.app ×0.35 · .dev/.gg/.eth ×0.3 · .crypto ×0.25 · Web3 others ×0.12–0.2 · long-tail ×0.1
- **Words:** single dictionary word ×3 · two-word ×1.8 · three-word ×1.2 · pronounceable brandable ×1.3 · awkward ×0.4
- **Penalties/premiums:** 1 hyphen ×0.4, 2+ ×0.2 · mixed digits ×0.5 · short all-numeric ×1.5 · hot keyword ×1.25

Source: [`src/lib/valuation.ts`](src/lib/valuation.ts).

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- No backend, no database, no auth — `localStorage` only (`src/lib/store.ts`)
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
src/app/            routes: / · /market · /upload · /bundles · /dashboard
src/components/     UI (Marketplace, Upload, Bundles, Dashboard, ListingModal, …)
src/lib/valuation.ts  deterministic valuation engine
src/lib/csv.ts        portfolio parser (CSV/TSV/plain list)
src/lib/categories.ts category + price-tier grouping
src/lib/seed.ts       demo listings & simulated offers (labeled demo data)
src/lib/store.ts      localStorage store + actions
ONESHOT.md          single prompt to regenerate this app with any AI coding tool
```

## Roadmap

- **v0.02 – Accounts & real bids:** auth (email / wallet), server-side listings and offers (Postgres), real-time bid notifications.
- **v0.03 – Registrar APIs:** import portfolios directly from GoDaddy, Namecheap, Dynadot and Unstoppable Domains; verify ownership via DNS TXT / registrar API; live expiry sync.
- **v0.04 – Escrow & payments:** escrow partner integration, Stripe / USDC settlement, push-transfer and auth-code workflows.
- **v0.05 – Pawn loans:** actual collateralized short-term loans with redemption windows and auto-renew from loan proceeds.
- **v0.06 – On-chain domains:** list and settle ENS / Unstoppable / other tokenized names natively; wallet connect; on-chain offers.
- **Pricing signals:** comparable-sales data, traffic and backlink signals, ML valuation alongside the transparent heuristic.
- **Liquidity tools:** dutch auctions, sweep-the-floor for buyers, bulk liquidation auctions, buyer alerts by keyword/TLD.

## Disclaimer

Prototype for demonstration. Nothing here is an appraisal, financial advice, or a binding offer to buy, sell or lend.
