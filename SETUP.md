# SETUP — login (Dynamic) + payments (Whop / crypto)

Everything ships **off by default**. Until you set the variables below, the header shows **"Log in / Sign up" → "Login opening soon"**, and every pay button says **"Card/Crypto checkout opening soon"**. Nothing can charge anyone.

Set variables in **Vercel → Project → Settings → Environment Variables** (Production + Preview), then **Redeploy** (`NEXT_PUBLIC_*` values are baked in at build time).

## 1. Login — dynamic.xyz

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | app.dynamic.xyz → **Developers → SDK & API Keys** → *Environment ID* (use the **Live** environment for production, Sandbox for testing) |

In the Dynamic dashboard also:

1. **Security → Allowed origins / CORS**: add each origin exactly:
   - `https://domain-pawnshop-v0-01.vercel.app`
   - `https://huddle-v0-01.vercel.app`
   - `https://dou-starter-kit.vercel.app`
   - `https://shotclock.store`
   - `https://www.shotclock.store`
   - (optional, for local testing) `http://localhost:3000`
2. **Log in & User Profile**: enable **Email**, the **social** providers you want (Google, X, Discord, Apple…), and **Wallets**.
3. **Chains & Networks**: enable **EVM** (Ethereum/Base/…) and **Solana**.
4. Optional: enable **embedded wallets** so email/social users get a wallet automatically.

Signed-in users are linked to the local guest profile (points/badges stay on the device and are tagged with the Dynamic user ID).

## 2. Card payments — Whop

| Variable | Tier | Price |
|---|---|---|
| `NEXT_PUBLIC_WHOP_PLAN_PLATINUM` | OG Platinum | $3.50 / month |
| `NEXT_PUBLIC_WHOP_PLAN_GOLD` | OG Gold | $9 / month |
| `NEXT_PUBLIC_WHOP_PLAN_DIAMOND` | OG Diamond | $25 / month |
| `NEXT_PUBLIC_WHOP_PLAN_OG_PASS` | OG Pass | $36 one-time |

Where: whop.com → **Dashboard → Products** → your product → **Pricing / Plans** → copy the **plan ID** (`plan_…`) or the plan's **checkout link**. Either works; IDs become `https://whop.com/checkout/<id>`.

Tier names, prices and perks live in ONE file: `kit/auth/payments.ts` (huddle: `src/components/auth/payments.ts`).

## 3. Crypto payments — Dynamic wallet (optional)

| Variable | Meaning |
|---|---|
| `NEXT_PUBLIC_CRYPTO_RECEIVER_EVM` | Your EVM receiving address (0x…) |
| `NEXT_PUBLIC_CRYPTO_RECEIVER_SOL` | Your Solana receiving address |
| `NEXT_PUBLIC_CRYPTO_AMOUNT_PLATINUM` / `_GOLD` / `_DIAMOND` / `_OG_PASS` | Amount **in the native token** (e.g. `0.0011` ETH). Never derived from the USD price — set it yourself. Unset = that tier's crypto button stays "opening soon". |

Crypto is a one-off wallet transfer (no auto-renewal); monthly tiers via crypto should be treated as one month of access.

## 4. The master switch

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | `false` (default). Set to `true` **only** when Whop plans, legal pages and taxes are ready. |

Every pay button shows the renewal + cancel disclosure and "Paid items never add giveaway entries. No purchase necessary."
