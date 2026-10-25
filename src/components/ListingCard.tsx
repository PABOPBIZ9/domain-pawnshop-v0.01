"use client";

import type { Listing, Offer } from "@/lib/types";
import { usd, valuate } from "@/lib/valuation";
import { Chip, DemoBadge, DomainArt } from "./ui";
import { UrgencyChip } from "./Valuation";
import { Countdown } from "./Countdown";

export function bestOffer(offers: Offer[], listingId: string): number {
  return bestOfferInfo(offers, listingId).amount;
}

/** Highest pending offer and whether it is simulated demo data. */
export function bestOfferInfo(offers: Offer[], listingId: string): { amount: number; demo: boolean } {
  let best: Offer | null = null;
  for (const o of offers) if (o.listingId === listingId && o.status === "pending" && (!best || o.amount > best.amount)) best = o;
  return best ? { amount: best.amount, demo: best.demo } : { amount: 0, demo: false };
}

export function ListingCard({ l, offers, now, onOpen }: { l: Listing; offers: Offer[]; now: number; onOpen: () => void }) {
  const v = l.kind === "domain" ? valuate(l.title, l.expiry, now) : null;
  const { amount: best, demo: bestDemo } = bestOfferInfo(offers, l.id);
  return (
    <button onClick={onOpen} data-listing={l.id} className="card p-2.5 text-left hover:border-violet hover:-translate-y-0.5 transition group">
      <div className="relative">
        <DomainArt title={l.title} kind={l.kind} count={l.domains.length} />
        <div className="absolute top-2 left-2 flex gap-1">
          {l.demo && <DemoBadge />}
          {!l.demo && !l.mine && <Chip tone="acid">live</Chip>}
          {l.mine && <Chip tone="acid">yours</Chip>}
        </div>
        {l.status !== "active" && (
          <div className="absolute inset-0 rounded-xl bg-black/60 grid place-items-center font-black tracking-widest text-lg uppercase">{l.status}</div>
        )}
      </div>
      <div className="px-1 pt-2.5 pb-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold truncate text-sm">{l.title}</div>
          {v && <Chip>{v.category}</Chip>}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase text-mute">Buy now</div>
            <div className="font-mono font-bold">{usd(l.price)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-mute">Best offer</div>
            <div className="font-mono text-sm text-mute">{best ? usd(best) : "—"}</div>
            {bestDemo && <DemoBadge />}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap min-h-5">{v && <UrgencyChip v={v} />}</div>
        {l.status === "active" && <Countdown endsAt={l.endsAt} label={l.clockLabel} />}
      </div>
    </button>
  );
}
