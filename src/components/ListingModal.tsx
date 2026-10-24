"use client";

import { useState } from "react";
import type { Listing, Offer } from "@/lib/types";
import { usd, valuate } from "@/lib/valuation";
import { buyNow, delist, placeOffer } from "@/lib/store";
import { ago } from "@/lib/now";
import { Chip, DemoBadge, DomainArt, Modal } from "./ui";
import { ValuationBreakdown } from "./Valuation";
import { bestOffer } from "./ListingCard";

type Tab = "buy" | "bid" | "offer";

export function ListingModal({ l, offers, now, onClose }: { l: Listing | null; offers: Offer[]; now: number; onClose: () => void }) {
  return (
    <Modal open={!!l} onClose={onClose} title={l?.title ?? ""}>
      {l && <Body key={l.id} l={l} offers={offers} now={now} onClose={onClose} />}
    </Modal>
  );
}

function Body({ l, offers, now, onClose }: { l: Listing; offers: Offer[]; now: number; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("buy");
  const best = bestOffer(offers, l.id);
  const [amount, setAmount] = useState<string>(String(Math.max(l.minBid, best ? best + 5 : l.minBid)));
  const [done, setDone] = useState<string>("");
  const v = l.kind === "domain" ? valuate(l.title, l.expiry, now) : null;
  const listingOffers = offers.filter((o) => o.listingId === l.id).sort((a, b) => b.amount - a.amount);
  const amt = Number(amount);
  const active = l.status === "active";
  const minRequired = tab === "bid" ? Math.max(l.minBid, best + 1) : 1;

  function submit() {
    if (tab === "buy") {
      buyNow(l.id);
      setDone(`Purchased ${l.title} for ${usd(l.price)} — simulated, no payment was taken.`);
    } else {
      placeOffer(l.id, amt, tab);
      setDone(`Your ${tab} of ${usd(amt)} was recorded (stored locally).`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-[200px_1fr] gap-4">
        <DomainArt title={l.title} kind={l.kind} count={l.domains.length} />
        <div className="space-y-2 text-sm">
          <div className="flex gap-1.5 flex-wrap">
            {l.demo && <DemoBadge />}
            {l.mine && <Chip tone="acid">your listing</Chip>}
            <Chip>{l.kind === "bundle" ? `Bundle · ${l.domains.length} names` : "Single domain"}</Chip>
            {l.registrar && <Chip>{l.registrar}</Chip>}
            {l.status !== "active" && <Chip tone="hot">{l.status}</Chip>}
          </div>
          <div className="text-mute">
            Seller <span className="text-white font-mono">{l.seller}</span> · listed {ago(l.createdAt, now)}
          </div>
          {l.expiry && <div className="text-mute">Expiry: <span className="text-white">{l.expiry}</span></div>}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <MiniStat label="Buy now" value={usd(l.price)} />
            <MiniStat label="Min bid" value={usd(l.minBid)} />
            <MiniStat label="Best offer" value={best ? usd(best) : "—"} />
          </div>
        </div>
      </div>

      {l.kind === "bundle" && (
        <div className="flex flex-wrap gap-1.5">
          {l.domains.map((d) => (
            <Chip key={d}>{d}</Chip>
          ))}
        </div>
      )}

      {v && <ValuationBreakdown v={v} />}

      {done ? (
        <div className="rounded-xl border border-acid/40 bg-acid/10 text-acid p-3 text-sm flex items-center justify-between gap-3">
          <span>✓ {done}</span>
          <button className="btn btn-ghost text-white text-xs" onClick={onClose}>
            Close
          </button>
        </div>
      ) : l.mine ? (
        active && (
          <button className="btn btn-ghost w-full" onClick={() => delist(l.id)}>
            Delist
          </button>
        )
      ) : active ? (
        <div className="rounded-xl border border-line p-3 space-y-3">
          <div className="flex gap-1 bg-panel2 rounded-lg p-1 w-fit">
            {(["buy", "bid", "offer"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-md text-sm ${tab === t ? "bg-violet text-white" : "text-mute"}`}>
                {t === "buy" ? "Buy now" : t === "bid" ? "Place bid" : "Make offer"}
              </button>
            ))}
          </div>
          {tab === "buy" ? (
            <p className="text-sm text-mute">
              Buy instantly at <span className="text-white font-mono">{usd(l.price)}</span>. v0.01 simulates the purchase — no payment, escrow or transfer.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-mute">$</span>
              <input className="input w-40 font-mono" type="number" min={minRequired} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <span className="text-xs text-mute">{tab === "bid" ? `Min ${usd(minRequired)} (must beat best offer)` : "Any amount — seller decides"}</span>
            </div>
          )}
          <button className="btn btn-acid w-full" disabled={tab !== "buy" && (!amt || amt < minRequired)} onClick={submit}>
            {tab === "buy" ? `Buy now for ${usd(l.price)}` : `Submit ${tab} ${amt ? usd(amt) : ""}`}
          </button>
        </div>
      ) : null}

      <div>
        <div className="text-xs uppercase tracking-wider text-mute mb-2">Offers & bids</div>
        {listingOffers.length === 0 ? (
          <div className="text-sm text-mute">No offers yet.</div>
        ) : (
          <ul className="space-y-1 text-sm">
            {listingOffers.map((o) => (
              <li key={o.id} className="flex justify-between bg-panel2 rounded-lg px-3 py-1.5">
                <span>
                  <span className="font-mono">{o.from}</span> <span className="text-mute">· {o.type}</span> {o.demo && <DemoBadge className="ml-1" />}
                </span>
                <span className="font-mono">
                  {usd(o.amount)} <span className="text-mute text-xs">{o.status}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel2 border border-line px-2 py-1.5">
      <div className="text-[10px] uppercase text-mute">{label}</div>
      <div className="font-mono font-bold text-sm">{value}</div>
    </div>
  );
}
