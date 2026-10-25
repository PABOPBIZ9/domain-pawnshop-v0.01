"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createBundle, deleteBundle, listBundle, useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { PRICE_TIERS, TIER_LABEL } from "@/lib/categories";
import { nice, usd, valuate } from "@/lib/valuation";
import type { Bundle } from "@/lib/types";
import { Chip, Empty, Modal } from "./ui";

export function Bundles() {
  const s = useStore();
  const now = useNow();
  const [mode, setMode] = useState<"category" | "tier" | "tld" | "length">("category");
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [listing, setListing] = useState<Bundle | null>(null);
  const [msg, setMsg] = useState("");

  const vals = useMemo(() => s.portfolio.map((p) => ({ p, v: valuate(p.domain, p.expiry, now) })), [s.portfolio, now]);
  const listedDomains = new Set(s.listings.filter((l) => l.mine && l.status === "active").flatMap((l) => l.domains));

  const groups = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const { p, v } of vals) {
      const key =
        mode === "category"
          ? v.category
          : mode === "tier"
            ? TIER_LABEL[v.tier]
            : mode === "tld"
              ? `.${v.tld}`
              : v.length <= 5
                ? "Short (≤5 chars)"
                : v.length <= 9
                  ? "Medium (6–9 chars)"
                  : "Long (10+ chars)";
      m.set(key, [...(m.get(key) ?? []), p.domain]);
    }
    const order = mode === "tier" ? PRICE_TIERS.map((t) => TIER_LABEL[t]) : null;
    return [...m.entries()].sort((a, b) => (order ? order.indexOf(a[0]) - order.indexOf(b[0]) : b[1].length - a[1].length));
  }, [vals, mode]);

  const valueOf = (domains: string[]) =>
    domains.reduce(
      (t, d) => {
        const v = vals.find((x) => x.p.domain === d)?.v ?? valuate(d, "", now);
        return { low: t.low + v.low, high: t.high + v.high, buyout: t.buyout + v.buyout };
      },
      { low: 0, high: 0, buyout: 0 },
    );

  function make(n: string, domains: string[]) {
    if (domains.length < 2) return;
    createBundle(n, domains);
    setMsg(`✓ Bundle "${n}" created — list it below.`);
    setPicked([]);
    setName("");
  }

  if (s.hydrated && s.portfolio.length === 0 && s.bundles.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-black tracking-tight">Bundles</h1>
        <Empty>
          Your portfolio is empty. <Link className="text-acid underline" href="/upload">Upload domains</Link> to get auto-grouped bundle suggestions.
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Bundles</h1>
        <p className="text-mute text-sm mt-1">Sell the long tail in lots. Auto-grouped from your portfolio — or hand-pick your own.</p>
      </div>
      {msg && <div className="rounded-xl border border-acid/40 bg-acid/10 text-acid p-3 text-sm">{msg}</div>}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold mr-2">Suggested bundles</h2>
          {(["category", "tier", "tld", "length"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-lg text-sm ${mode === m ? "lx-chip font-bold" : "bg-panel2 text-mute"}`}>
              by {m === "tier" ? "price tier" : m}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(([key, domains]) => {
            const t = valueOf(domains);
            return (
              <div key={key} className="card p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-bold">{key}</div>
                  <Chip>{domains.length} names</Chip>
                </div>
                <div className="flex flex-wrap gap-1">
                  {domains.slice(0, 8).map((d) => (
                    <Chip key={d}>{d}</Chip>
                  ))}
                  {domains.length > 8 && <Chip>+{domains.length - 8}</Chip>}
                </div>
                <div className="text-xs text-mute font-mono">
                  Range {usd(t.low)}–{usd(t.high)} · buyout sum {usd(t.buyout)}
                </div>
                <button className="btn btn-ghost text-sm w-full" disabled={domains.length < 2} onClick={() => make(`${key} Lot`, domains)}>
                  {domains.length < 2 ? "Need 2+ names" : "Create this bundle"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-bold">Custom bundle</h2>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {s.portfolio.map((p) => {
            const on = picked.includes(p.domain);
            return (
              <button
                key={p.id}
                onClick={() => setPicked(on ? picked.filter((d) => d !== p.domain) : [...picked, p.domain])}
                className={`text-xs px-2.5 py-1 rounded-full border ${on ? "lx-sig border-transparent" : "border-line text-mute"} ${listedDomains.has(p.domain) ? "opacity-50" : ""}`}
              >
                {p.domain}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input className="input flex-1 min-w-48" placeholder="Bundle name, e.g. Crypto Fire Sale" value={name} onChange={(e) => setName(e.target.value)} />
          <span className="text-xs text-mute font-mono">
            {picked.length} picked · buyout sum {usd(valueOf(picked).buyout)}
          </span>
          <button className="btn btn-acid" disabled={picked.length < 2 || !name.trim()} onClick={() => make(name.trim(), picked)}>
            Create bundle
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">My bundles</h2>
        {s.bundles.length === 0 ? (
          <Empty>No bundles yet.</Empty>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {s.bundles.map((b) => {
              const t = valueOf(b.domains);
              return (
                <div key={b.id} className="card p-4 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-bold">📦 {b.name}</div>
                    {b.listed ? <Chip tone="acid">listed</Chip> : <Chip>draft</Chip>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {b.domains.map((d) => (
                      <Chip key={d}>{d}</Chip>
                    ))}
                  </div>
                  <div className="text-xs text-mute font-mono">
                    Range {usd(t.low)}–{usd(t.high)} · suggested lot price {usd(nice(t.buyout * 1.2))}
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-acid text-sm flex-1" disabled={b.listed} onClick={() => setListing(b)}>
                      {b.listed ? "Listed on marketplace" : "List bundle"}
                    </button>
                    <button className="btn btn-ghost text-sm" disabled={b.listed} onClick={() => deleteBundle(b.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ListBundleModal
        b={listing}
        suggested={listing ? nice(valueOf(listing.domains).buyout * 1.2) : 0}
        onClose={() => setListing(null)}
        onDone={(n) => {
          setListing(null);
          setMsg(`✓ "${n}" is live on the marketplace. Simulated demo bids will appear in your dashboard.`);
        }}
      />
    </div>
  );
}

function ListBundleModal({ b, suggested, onClose, onDone }: { b: Bundle | null; suggested: number; onClose: () => void; onDone: (n: string) => void }) {
  return (
    <Modal open={!!b} onClose={onClose} title={b ? `List "${b.name}"` : ""}>
      {b && <PriceForm key={b.id} suggested={suggested} onSubmit={(p, m) => {
            listBundle(b, p, m);
            onDone(b.name);
          }} />}
    </Modal>
  );
}

export function PriceForm({ suggested, onSubmit }: { suggested: number; onSubmit: (price: number, minBid: number) => void }) {
  const [price, setPrice] = useState(String(suggested));
  const [minBid, setMinBid] = useState(String(nice(suggested * 0.5)));
  const p = Number(price);
  const m = Number(minBid);
  return (
    <div className="space-y-3 text-sm">
      <label className="block">
        <span className="text-mute">Buy-now price (USD)</span>
        <input className="input w-full font-mono mt-1" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-mute">Minimum bid (USD)</span>
        <input className="input w-full font-mono mt-1" type="number" min={1} value={minBid} onChange={(e) => setMinBid(e.target.value)} />
      </label>
      <p className="text-[11px] text-mute">Suggested from the indicative heuristic: {usd(suggested)}. Listing is stored locally; no transfer or escrow happens in v0.01.</p>
      <button className="btn btn-acid w-full" disabled={!p || p < 1 || !m || m > p} onClick={() => onSubmit(p, m)}>
        List for {p ? usd(p) : "—"}
      </button>
    </div>
  );
}
