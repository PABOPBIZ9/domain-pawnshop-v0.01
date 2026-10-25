"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { tierOf, TIER_META, TIER_ORDER, type Tier } from "@/lib/shotclock";
import { usd, valuate } from "@/lib/valuation";
import type { Listing } from "@/lib/types";
import { Countdown, TierChip } from "./Countdown";
import { ListingModal } from "./ListingModal";
import { bestOfferInfo } from "./ListingCard";
import { Chip, DemoBadge, Empty } from "./ui";

function tierOfListing(l: Listing, now: number): Tier {
  return l.expiry ? tierOf(l.expiry, now) : "UNKNOWN";
}

export function ShotClockBoard({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const s = useStore();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | "all">("all");
  const live = s.listings
    .filter((l) => l.status === "active" && l.endsAt)
    .map((l) => ({ l, tier: tierOfListing(l, now) }))
    .sort((a, b) => (a.l.endsAt ?? 0) - (b.l.endsAt ?? 0));
  const counts = TIER_ORDER.map((t) => [t, live.filter((x) => x.tier === t).length] as const).filter(([, n]) => n > 0);
  const rows = live.filter((x) => tier === "all" || x.tier === tier).slice(0, limit);
  const open = s.listings.find((l) => l.id === openId) ?? null;

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTier("all")} className={`px-3 py-1 rounded-lg text-sm ${tier === "all" ? "bg-violet text-white" : "bg-panel2 text-mute"}`}>
            All ({live.length})
          </button>
          {counts.map(([t, n]) => (
            <button key={t} onClick={() => setTier(t)} className={`px-3 py-1 rounded-lg text-sm ${tier === t ? "bg-violet text-white" : "bg-panel2 text-mute"}`}>
              {TIER_META[t].short} ({n})
            </button>
          ))}
        </div>
      )}
      {!s.hydrated ? (
        <Empty>Loading the clock…</Empty>
      ) : rows.length === 0 ? (
        <Empty>Nothing on the clock.</Empty>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {rows.map(({ l, tier: t }, i) => {
            const v = l.kind === "domain" ? valuate(l.title, l.expiry, now) : null;
            const best = bestOfferInfo(s.offers, l.id);
            return (
              <button key={l.id} onClick={() => setOpenId(l.id)} className="w-full text-left px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 hover:bg-panel2">
                <span className="font-mono text-mute text-xs w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-bold min-w-0 flex-1 truncate">
                  {l.kind === "bundle" ? "📦 " : ""}
                  {l.title}
                </span>
                <span className="flex items-center gap-1.5">
                  {t !== "UNKNOWN" && <TierChip tier={t} />}
                  {v && <Chip>{v.category}</Chip>}
                  {l.demo && <DemoBadge />}
                </span>
                <span className="w-full sm:w-auto sm:min-w-56">
                  <Countdown endsAt={l.endsAt} label={l.clockLabel} />
                </span>
                <span className="font-mono font-bold w-20 text-right">{usd(l.price)}</span>
                <span className="font-mono text-xs text-mute w-36 text-right flex items-center justify-end gap-1">
                  {best.amount ? `bid ${usd(best.amount)}` : "no bids"}
                  {best.demo && <DemoBadge />}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <ListingModal l={open} offers={s.offers} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
}

export function ShotClockPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          ⏱ The Shot <span className="text-acid">Clock</span>
        </h1>
        <p className="text-mute text-sm mt-1 max-w-2xl">
          Every live name, sorted by whose clock runs out first. Expired names show the estimated end of their grace or redemption window. Once the
          clock hits zero, the name may drop for good. Bid before it does.
        </p>
      </div>
      <ShotClockBoard />
      <p className="text-[11px] text-mute">
        Grace and redemption windows are typical-registrar estimates (about 30 days each) and vary by registrar. Countdowns are relative and run off your
        device clock.
      </p>
    </div>
  );
}
