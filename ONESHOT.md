# ONESHOT: SHOTCLOCK v0.01 (domains on the clock)

> Paste everything below the line into Claude, Gemini, ChatGPT, Cursor, v0, Bolt, Lovable or any AI coding tool. It is a complete, self-contained spec for regenerating the v0.01 app from scratch.

---

You are a senior full-stack engineer. Build a complete, production-quality **v0.01 prototype** of **SHOTCLOCK**, a live, countdown-driven quick-sale marketplace for domain names (FOMO, urgency, live shopping, "the trenches"), inspired by OpenSea, Magic Eden and Tensor, with instant-liquidity tools (valuation, instant pawn and buyout quotes, bundles). Output every file needed (full contents, no placeholders, no "TODO: implement"), so that `npm install && npm run build` passes and `npm run lint` is clean.

## 1. Product context

Domain investors hold hundreds of names across GoDaddy, Namecheap, Dynadot, Unstoppable Domains and others. Many expire because renewals are expensive, and the long tail of names never justifies a traditional broker. The app lets anyone upload a portfolio, receive indicative valuations, bundle domains by category or price, solicit quick bids, and sell directly to investors, resellers and end users. Think rapid offers, bulk liquidation, and automated pricing signals.

SHOTCLOCK puts every name on a visible **shot clock**: a live, relative countdown to its expiry or to the estimated end of its grace or redemption window. Names are priced with a transparent heuristic, families are bundled into quick-sale lots, and buyers bid before the clock runs out.

v0.01 is a **front-end-only prototype** with no backend, database, auth or real payments. Visitor activity persists in `localStorage`. The live inventory comes from a static file of the owner's real names (domain, registrar, expiry only), and these listings are NOT marked demo. Any auto-generated offers, bids or activity ARE visibly labeled **DEMO DATA**. A site-wide notice bar says: "v0.01: prices are indicative heuristics, not appraisals. Offers, bids and purchases are simulated, and no money moves." 

## 2. Stack & constraints

- Latest **Next.js App Router** + **React** + **TypeScript (strict)** + **Tailwind CSS v4** (`@import "tailwindcss"` and `@theme inline` tokens in `globals.css`).
- No external services, no paid APIs, no extra runtime dependencies beyond next/react/react-dom (fonts via `next/font/google` Geist + Geist Mono are fine).
- All routes must be statically prerenderable (○ Static). Pages are thin server components that render a `"use client"` component.
- Read `localStorage` only on the client via `useSyncExternalStore` (server snapshot = empty state) to avoid hydration mismatches. Don't call `Date.now()` during render; expose a `useNow()` hook built on `useSyncExternalStore` that returns a session-stable timestamp on the client and `0` on the server.
- Must pass the default `eslint-config-next` (core-web-vitals + typescript), including React Compiler hook rules (avoid `setState` in effects and fragile `useMemo` dependencies).
- Countdowns must be **relative only** (`3d 04:12:09`). Never display wall-clock times, time zones or user location anywhere. Relative "5m ago" labels are fine. Do not link any personal GitHub/social accounts in the UI.
- Live countdowns use a shared 1-second ticker exposed as `useTick()` (built on `useSyncExternalStore`, server snapshot `0`, which renders `⏱ --:--:--` before hydration).

## 3. Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing: pulsing "LIVE · names are expiring right now" pill; hero "Domains on the shot clock."; CTAs *Beat the clock* → `/shotclock`, *Browse the floor* → `/market`, *Value my names* → `/upload`; stats (live names & lots, floor, already expired, lots); "Running out first" (top 8 of the Shot Clock board); 5-step strip (On the clock → Priced to move → Quick-sale lots → Bid fast → Close); "Top of the board" (8 highest-priced listings); explainer cards (Instant buyout, Instant pawn, Trench lots); DOU DIGITAL teaser with waitlist. |
| `/shotclock` | **The Shot Clock**: every active listing with a deadline, sorted soonest first, with tier filter chips and counts. Each row shows rank, name, tier chip, category, live countdown with label, price, and best bid (with a DEMO DATA badge if simulated). Click opens the listing modal. Footnote explains that grace/redemption windows are estimates. |
| `/dou` | DOU DIGITAL ecosystem teaser: creator-first mission, product cards (Dou Dizhu game, Dou Agency social-listening remix studio, SHOTCLOCK quizzes/prizes, drops & giveaways, creator directory, fan-first rewards), email waitlist saved to localStorage only, clearly labeled. |
| `/market` | Marketplace grid + filters + collections + stats + activity feed + listing modal. |
| `/upload` | Paste/upload portfolio, preview table with valuations and totals, add to portfolio; single-domain quick check with full factor breakdown; "How the heuristic works" section. |
| `/bundles` | Auto-suggested bundles, custom bundle builder, my bundles with list/delete. |
| `/dashboard` | Seller dashboard: stats, expiring-soon alerts, portfolio table, bulk actions, offers received (accept/decline), my listings (delist), my bids. Reset-data button (confirm → re-seed). |
| 404 | Branded not-found page. |

Global layout: sticky top nav (⏱ badge + `SHOT` `CLOCK` wordmark with CLOCK in acid green + `v0.01` chip; links ⏱ Shot Clock, Marketplace, Upload & Value, Bundles, Dashboard, DOU DIGITAL; CTA *Beat the clock*), a slim pink notice bar under the nav (the indicative/simulated notice), and a footer repeating it plus "anything marked DEMO DATA is simulated".

## 4. Data model (`src/lib/types.ts`)

```ts
type Registrar = "GoDaddy" | "Namecheap" | "Dynadot" | "Unstoppable" | "Other";
interface PortfolioDomain { id; domain; registrar: Registrar; expiry: string /* YYYY-MM-DD or "" */; costBasis?: number; addedAt: number }
interface Listing { id; kind: "domain" | "bundle"; title; domains: string[]; price /* buy now */; minBid; seller; mine: boolean; demo: boolean;
  status: "active" | "sold" | "delisted"; createdAt; expiry? /* bundles: earliest item expiry */; registrar?; bundleId?;
  endsAt? /* shot clock deadline, ms */; clockLabel? /* "expires in" | "grace ends in (est.)" | "drops in (est.)" | "sale ends in" | "first name …" */ }
interface Bundle { id; name; domains: string[]; createdAt; listed: boolean }
interface Offer { id; listingId; amount; from; type: "bid" | "offer"; status: "pending" | "accepted" | "declined"; mine: boolean; demo: boolean; createdAt }
interface Activity { id; type: "list"|"bid"|"offer"|"sale"|"accept"|"decline"|"delist"|"upload"; text; amount?; demo: boolean; createdAt }
interface AppState { version: 1; seeded: boolean; portfolio; listings; bundles; offers; activity }
```

Store (`src/lib/store.ts`): module-level cached state, `localStorage` key `shotclock:v0.01`, listeners set, `storage` event sync across tabs, `useStore()` hook returning state + `hydrated` flag. Actions: `addToPortfolio(rows)` (dedupe), `loadSamplePortfolio()`, `removeFromPortfolio(ids)`, `listDomain(domain, price, minBid)` (sets a 7-day sale clock: `endsAt = now + 7d`, `clockLabel = "sale ends in"`), `createBundle(name, domains)`, `deleteBundle(id)`, `listBundle(bundle, price, minBid)`, `delist(id)`, `placeOffer(listingId, amount, type)`, `buyNow(listingId)`, `respondOffer(offerId, accept)` (accept → listing sold at offer price, other pending offers declined, domains removed from portfolio), `resetAll()`. Every action appends an Activity entry.

When the user lists a domain or bundle, generate **1–2 simulated incoming offers** (deterministic from a hash of the listing id; 50–90% of price; from demo buyer handles like `demo_bidbot`, `demo_reseller`, `demo_endUser`, `demo_fundA`, `demo_collector`, `demo_trencher`) marked `demo: true` so the accept/decline flow can be tested.

## 5. Portfolio parsing (`src/lib/csv.ts`)

- Accept CSV, TSV or `;`-separated, quoted fields, optional header. Header detection by keywords: domain/name, registrar/platform/provider, expir/renew/date, cost/basis/paid/price.
- Without a header, columns are `domain, registrar, expiry, cost_basis`. A plain list (one or many domains per line, separated by whitespace/commas) also works.
- Normalize domains: lowercase, strip protocol, `www.`, paths and invalid chars; validate `label(.tld)+`. Mark invalid rows with an error (shown in preview, not imported). Dedupe.
- Registrar normalization: anything containing godaddy/namecheap/dynadot/unstoppable (or `ud`) → canonical; else `Other`.
- Dates: `YYYY-MM-DD`, `MM/DD/YYYY`, `MM-DD-YY`, or anything `Date.parse` understands → `YYYY-MM-DD`.
- Provide a 10-row `SAMPLE_CSV` (mix of registrars, .com/.io/.ai/.crypto/.x/.net/.co/.xyz, a hyphenated name, a numeric name, some expiring within 2–4 weeks, some with no expiry) plus "Use sample" and "Download template" buttons and a file input.

## 6. Valuation heuristic (`src/lib/valuation.ts`) — deterministic, transparent

`valuate(domain, expiry?, now)` returns `{ domain, label, tld, length, category, tier, low, high, mid, score, ltv, pawnOffer, buyout, daysToExpiry, urgency, factors[] }` where each factor is `{ label, multiplier | null, detail }` and is displayed in a table.

1. **Length base** (label = part before first dot): ≤2 → $25,000 · 3 → $6,000 · 4 → $1,800 · 5 → $900 · 6 → $500 · 7 → $320 · 8 → $220 · 9–10 → $140 · 11–14 → $70 · 15+ → $25.
2. **TLD multiplier:** com 1.0 · ai 0.8 · io 0.55 · co 0.45 · net/org/app 0.35 · dev/gg/eth 0.3 · crypto/me 0.25 · so 0.22 · nft/x 0.2 · xyz/wallet/dao 0.15 · bitcoin/blockchain 0.12 · club 0.1 · online/site 0.08 · anything else 0.1. Tier label: Tier 1 (com, ai), Tier 2 (io, co, net, org, app), Tier 3 (dev, gg), Web3 (eth, crypto, nft, x, wallet, dao, bitcoin, blockchain), else Long-tail.
3. **Hyphens:** 1 → ×0.4, 2+ → ×0.2. **Digits:** all-numeric ≤4 chars → ×1.5, all-numeric longer → ×0.8, digits mixed with letters → ×0.5.
4. **Words** (built-in dictionary of ~550 common short English/startup/crypto words, with simple plural support where `forks` matches `fork`; try the whole label, then 2-word split, then 3-word split with parts ≥2 chars): single word ×3 · two words ×1.8 · three words ×1.2 · otherwise pronounceable (3–10 letters, vowel ratio 0.25–0.65, no 4+ consonant run, no 3+ vowel run) ×1.3 · otherwise if length > 4 "hard to say" ×0.4.
5. **Hot keyword** (ai, crypto, pay, bank, loan, cash, bot, data, health, home, nft, token, trade) contained → ×1.25.
6. `mid = max(5, value)`; `low = nice(max(5, 0.6·mid))`; `high = nice(max(10, 1.6·mid))`. `nice()` rounds: <10 → integer, <100 → 5s, <1k → 10s, <10k → 50s, else 500s.
7. **Score** 0–100 = `round(log10(mid) / log10(50000) · 100)`, clamped 1–100.
8. **Expiry urgency** (days = floor((expiry − now)/day)): expired → LTV 10%, buyout ×0.30 · ≤14d "critical" → 15%, ×0.40 · ≤60d "soon" → 22%, ×0.48 · otherwise/unknown → 30%, ×0.55. Score ≥ 70 adds +5% LTV. `pawnOffer = nice(low × LTV)`, `buyout = nice(low × buyoutMult)`.
9. **Category** (`src/lib/categories.ts`): Numeric if all digits; Web3 TLDs → "Crypto & Web3"; .ai → "AI & Tech"; else keyword match into AI & Tech, Crypto & Web3, Finance, Cannabis, Health, Gaming, Real Estate, Food & Drink, Travel (short keywords ≤3 chars must match as prefix/suffix/whole; longer as substring); else "Short (≤4)" if ≤4 chars; else Brandable if pronounceable; else Other. **Price tier:** Floor (<$50), Mid ($50–500), Premium ($500–5k), Grail ($5k+).

Always show the disclaimer: "Indicative heuristic, not an appraisal."

## 7. Shot clock model (`src/lib/shotclock.ts`) and live inventory (`src/data/inventory.ts`, `src/lib/seed.ts`)

**Urgency tiers** from `days = floor((expiry − now)/day)`: `REDEMPTION` (31–60 days past expiry, est.), `GRACE` (1–30 days past, est.), `7D` (0–7 left), `30D`, `90D`, `LATER`, `UNKNOWN`. Each tier has a short chip label (REDEMPTION, GRACE, ≤7 DAYS, ≤30 DAYS, ≤90 DAYS, 90+ DAYS) and tone (hot pink for redemption/grace/≤7d, amber for ≤30d, violet for ≤90d). **nextDeadline(expiry, now)** returns the expiry ("expires in"), or else expiry + 30d ("grace ends in (est.)"), or else expiry + 60d ("drops in (est.)"). `formatCountdown(ms)` → `Nd HH:MM:SS`.

**Inventory file:** `INVENTORY: { domain, registrar, expiry }[]` and `INVENTORY_BUNDLES: { name, items[] }[]`. Put the owner's real for-sale names here (domain, registrar and expiry only; never wallet, account or DNS data). Keep brand, ecosystem and live-project names OUT of the file. Example rows: `{ domain: "buymebag.com", registrar: "Unstoppable", expiry: "2026-10-28" }`, and a lot named `"puffcoin.* lot (9 names)"`.

**Seed** (first load, no stored state): each inventory item becomes an active listing with seller `SHOTCLOCK`, `demo: false`, `price = nice(max(mid, 2 × buyout))`, `minBid = nice(price × 0.5)`, and `endsAt`/`clockLabel` from `nextDeadline`. Each bundle becomes a lot priced at `nice(1.2 × Σ buyout)`, with `expiry` set to the earliest item expiry and the clock set to the earliest item deadline ("first name …"). Every listing gets a non-demo "hit the shot clock" activity row. About a quarter of listings (FNV-1a hash % 4 === 0) get a pending **demo** bid (`demo: true`, 100–140% of min bid) plus a demo activity row. There are no fake listings and no fake sales. Portfolio starts empty (the dashboard offers "load a sample portfolio").

## 8. UX & visual style

- Dark, crypto-marketplace look (Tensor/Magic Eden): near-black background `#07070b` with subtle violet and acid-green radial glows (fixed attachment), panels `#11111a` with `#262636` borders, rounded-2xl cards, acid accent `#c6ff3d` for primary actions and positive numbers, violet `#8b5cf6` for secondary/tabs, hot pink `#ff4d8d` for demo badges, expired and negative factors, amber for "expires soon". Monospace for prices and numbers.
- **Countdown component:** `⏱ <label> <Nd HH:MM:SS>`. Acid green normally, hot pink and pulsing under 3 days, "clock ran out" at zero. Relative only.
- **Listing card:** generated "domain art" tile (4:3, two-hue gradient + blurred orb derived from the hash of the title; big bold label with the TLD in acid green, wrapping only between label and TLD; bundles show "📦 bundle · N names"), demo/yours badges, SOLD overlay, title, category chip, Buy now price, best offer (DEMO DATA badge if the best offer is simulated), tier chip (`GRACE · 12d past`, `≤7 DAYS · 4d left`), live countdown, and a "live" chip for real house listings. Hover lifts and borders violet.
- **Listing modal:** art, badges, seller + "listed Xm ago", expiry, a large live countdown, mini stats (buy now / min bid / best offer, labeled "(demo)" when simulated), bundle domain chips, full valuation breakdown, tabbed actions **Buy now / Place bid / Make offer** (bid must be ≥ max(minBid, best offer + 1); offers any amount), success message clarifying "simulated — no payment taken", offers & bids list. Own listings show Delist instead. Close via × or backdrop.
- **Marketplace:** stats row (floor price, listed + bundle count, volume + simulated sales count, open offers with "N are demo data", top offer); horizontally scrolling "Collections by TLD" chips (count + floor, click to filter); filter bar (search, TLD, category, type domains/bundles, min $, max $, max length, on the clock (≤60d or expired), show sold, sort **shot clock: soonest first (default)** / newest / price ↑ / price ↓); responsive grid (2/3/4 cols); sticky-ish activity feed sidebar with icons, amounts, relative time, demo badges.
- **Upload:** two columns (paste/upload + quick check), preview table (domain, registrar, expiry + urgency chip, category or error, range, pawn, buyout) with totals chips (range, pawn total, buyout total), "Add N to portfolio" → success + link to dashboard.
- **Bundles:** group-by toggle (category / price tier / TLD / length); suggestion cards (name, count, first 8 chips, range + buyout sum, "Create this bundle" needs ≥2 names); custom builder (toggle chips from portfolio, name, buyout sum); my bundles (listed/draft chip, suggested lot price = 1.2× buyout sum, List bundle → price form modal with buy-now + min bid (default 50%), Delete).
- **Dashboard:** stats (portfolio count + listed, indicative value range, pawn total, buyout total, offers pending); expiring-soon alert panel (≤60d or expired) with quick "list"; portfolio table with select-all checkboxes, domain click → valuation modal, per-row List (price form prefilled with max(mid, 2×buyout), min bid = buyout) or "listed" chip; bulk "List N at suggested", "Bundle names" link, "Remove"; offers received with Accept/Decline (or status chip); my listings with delist; my bids & offers.
- Fully responsive down to 390px wide (no horizontal page overflow; nav scrolls horizontally). Accessible labels on inputs/selects/checkboxes; modals have `role="dialog"`.

## 9. Files to produce

```
package.json, tsconfig.json, next.config.ts, eslint.config.mjs, .gitignore, README.md
src/app/layout.tsx, globals.css, page.tsx, not-found.tsx, shotclock/page.tsx, market/page.tsx, upload/page.tsx, bundles/page.tsx, dashboard/page.tsx, dou/page.tsx
src/components/Nav.tsx, Footer.tsx, ui.tsx (DemoBadge, Chip, Stat, DomainArt, Modal, Empty), Valuation.tsx (ValuationBreakdown, UrgencyChip),
  Countdown.tsx (Countdown, TierChip), ShotClock.tsx (ShotClockBoard, ShotClockPage), DouTeaser.tsx, ListingCard.tsx, ListingModal.tsx, ActivityFeed.tsx, Marketplace.tsx, Upload.tsx, Bundles.tsx (+ PriceForm), Dashboard.tsx, Home.tsx
src/lib/types.ts, words.ts, categories.ts, valuation.ts, shotclock.ts, csv.ts, seed.ts, store.ts, now.ts (useNow, useTick, ago)
src/data/inventory.ts
```

README: what it is, feature table, heuristic summary, stack, run commands, layout, roadmap (accounts, real bids & timed auctions → registrar API imports + ownership verification → escrow & payments (Stripe/USDC) → real pawn loans with redemption windows → on-chain domains (ENS/Unstoppable) → comps/ML pricing signals → auctions & sweep-the-floor), disclaimer.

## 10. Acceptance criteria

1. `npm run build` succeeds; all 7 routes (/, /shotclock, /market, /upload, /bundles, /dashboard, /dou) + 404 prerender as static; `npm run lint` reports 0 errors/warnings; TypeScript strict passes.
2. First visit seeds the live inventory as non-demo listings and lots with countdowns. Every simulated offer/bid/activity row shows a **DEMO DATA** badge. The site-wide notice bar is always visible. Reload preserves state; "Reset data" restores the seed.
2b. `/shotclock` lists every listing with a deadline, soonest first, with tier filters; countdowns tick every second and never show wall-clock times or time zones. Brand/ecosystem names never appear for sale.
3. Pasting the sample CSV shows 10 valid rows with registrar, expiry, category, range, pawn and buyout, and totals; invalid lines are flagged; "Add to portfolio" moves them to the dashboard; duplicates are skipped. Plain one-per-line lists work.
4. `valuate()` is deterministic: same domain + expiry + reference date → identical output. Examples (expiry 8 days out): `pawn.com` ≈ $3,250–$8,650; `quick-loan-hub.net` ≈ $5–$10; expiring names show reduced LTV in the factor table.
5. Marketplace filters (TLD, category, type, price range, length, expiring, sold) and sorts all work and combine; collections chips filter by TLD; stats update after buys/sales.
6. Buy now marks the listing SOLD and adds a "simulated — no payment taken" activity row; bids below the minimum are blocked; offers/bids appear in the modal and in Dashboard → My bids.
7. Listing a domain or bundle creates it on the marketplace (badge "yours") and produces 1–2 simulated demo offers in Dashboard → Offers received; Accept marks it sold at the offer amount and removes the names from the portfolio; Decline updates status; Delist removes it from the grid.
8. Bundles page auto-groups the portfolio four ways, creates custom bundles (≥2 names + name), and lists them as a single lot.
9. Every valuation surface shows "Indicative heuristic, not an appraisal"; no clocks, time zones, locations or personal account links appear anywhere in the UI.
10. Looks great on desktop (1366px) and mobile (390px) with the dark OpenSea/Tensor aesthetic and FOMO/live-shopping energy described above.
