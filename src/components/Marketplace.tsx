"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { CATEGORIES } from "@/lib/categories";
import { splitDomain, usd, valuate } from "@/lib/valuation";
import type { Listing } from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { ListingModal } from "./ListingModal";
import { ActivityFeed } from "./ActivityFeed";
import { DemoBadge, Empty, Stat } from "./ui";

type Sort = "new" | "price-asc" | "price-desc" | "expiring";

export function Marketplace() {
  const s = useStore();
  const now = useNow();
  const [q, setQ] = useState("");
  const [tld, setTld] = useState("all");
  const [cat, setCat] = useState("all");
  const [kind, setKind] = useState<"all" | "domain" | "bundle">("all");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [maxLen, setMaxLen] = useState("");
  const [expiring, setExpiring] = useState(false);
  const [showSold, setShowSold] = useState(false);
  const [sort, setSort] = useState<Sort>("new");
  const [openId, setOpenId] = useState<string | null>(null);

  const enriched = useMemo(
    () =>
      s.listings
        .filter((l) => l.status !== "delisted")
        .map((l) => {
          const { label, tld } = splitDomain(l.domains[0] ?? l.title);
          const v = l.kind === "domain" ? valuate(l.title, l.expiry, now) : null;
          return { l, tld: l.kind === "domain" ? tld : "bundle", len: label.length, category: v?.category ?? "Bundle", days: v?.daysToExpiry ?? null };
        }),
    [s.listings, now],
  );

  const active = enriched.filter((e) => e.l.status === "active");
  const tlds = [...new Set(active.filter((e) => e.l.kind === "domain").map((e) => e.tld))].sort();

  const collections = (() => {
    const m = new Map<string, { count: number; floor: number }>();
    for (const e of active) {
      if (e.l.kind !== "domain") continue;
      const c = m.get(e.tld) ?? { count: 0, floor: Infinity };
      c.count++;
      c.floor = Math.min(c.floor, e.l.price);
      m.set(e.tld, c);
    }
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
  })();

  const rows = enriched
    .filter((e) => (showSold ? true : e.l.status === "active"))
    .filter((e) => !q || e.l.title.includes(q.toLowerCase()) || e.l.domains.some((d) => d.includes(q.toLowerCase())))
    .filter((e) => tld === "all" || e.tld === tld)
    .filter((e) => cat === "all" || e.category === cat)
    .filter((e) => kind === "all" || e.l.kind === kind)
    .filter((e) => !minP || e.l.price >= Number(minP))
    .filter((e) => !maxP || e.l.price <= Number(maxP))
    .filter((e) => !maxLen || (e.l.kind === "domain" && e.len <= Number(maxLen)))
    .filter((e) => !expiring || (e.days !== null && e.days <= 60))
    .sort((a, b) => {
      if (sort === "price-asc") return a.l.price - b.l.price;
      if (sort === "price-desc") return b.l.price - a.l.price;
      if (sort === "expiring") return (a.days ?? 1e9) - (b.days ?? 1e9);
      return b.l.createdAt - a.l.createdAt;
    });

  const floor = active.length ? Math.min(...active.map((e) => e.l.price)) : 0;
  const sold = s.listings.filter((l) => l.status === "sold");
  const volume = sold.reduce((sum, l) => sum + l.price, 0);
  const pendingOffers = s.offers.filter((o) => o.status === "pending");
  const topOffer = pendingOffers.reduce((m, o) => Math.max(m, o.amount), 0);
  const open: Listing | null = s.listings.find((l) => l.id === openId) ?? null;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Marketplace</h1>
          <p className="text-mute text-sm mt-1">
            Domains & bundles up for instant sale. Seeded listings are marked <DemoBadge />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Floor price" value={s.hydrated ? usd(floor) : "—"} />
        <Stat label="Listed" value={active.length} sub={`${active.filter((e) => e.l.kind === "bundle").length} bundles`} />
        <Stat label="Volume" value={usd(volume)} sub={`${sold.length} sales (incl. demo)`} />
        <Stat label="Open offers" value={pendingOffers.length} />
        <Stat label="Top offer" value={topOffer ? usd(topOffer) : "—"} />
      </div>

      {collections.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-mute mb-2">Collections by TLD</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setTld("all")} className={`card px-4 py-2 text-left shrink-0 ${tld === "all" ? "border-acid" : ""}`}>
              <div className="font-bold">All</div>
              <div className="text-[11px] text-mute">{active.length} items</div>
            </button>
            {collections.map(([t, c]) => (
              <button key={t} onClick={() => setTld(t)} className={`card px-4 py-2 text-left shrink-0 ${tld === t ? "border-acid" : ""}`}>
                <div className="font-bold">.{t}</div>
                <div className="text-[11px] text-mute">
                  {c.count} · floor {usd(c.floor)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4 min-w-0">
          <div className="card p-3 flex flex-wrap gap-2 items-center text-sm">
            <input className="input flex-1 min-w-0 basis-40" placeholder="Search names…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input max-w-full" value={tld} onChange={(e) => setTld(e.target.value)} aria-label="TLD">
              <option value="all">All TLDs</option>
              {tlds.map((t) => (
                <option key={t} value={t}>
                  .{t}
                </option>
              ))}
            </select>
            <select className="input max-w-full" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select className="input max-w-full" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Type">
              <option value="all">Domains + bundles</option>
              <option value="domain">Domains</option>
              <option value="bundle">Bundles</option>
            </select>
            <input className="input w-24" type="number" placeholder="Min $" value={minP} onChange={(e) => setMinP(e.target.value)} />
            <input className="input w-24" type="number" placeholder="Max $" value={maxP} onChange={(e) => setMaxP(e.target.value)} />
            <input className="input w-28" type="number" placeholder="Max length" value={maxLen} onChange={(e) => setMaxLen(e.target.value)} />
            <label className="flex items-center gap-1.5 px-2">
              <input type="checkbox" checked={expiring} onChange={(e) => setExpiring(e.target.checked)} /> Expiring ≤60d
            </label>
            <label className="flex items-center gap-1.5 px-2">
              <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} /> Show sold
            </label>
            <select className="input max-w-full" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="new">Newest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="expiring">Expiring soonest</option>
            </select>
          </div>

          {!s.hydrated ? (
            <Empty>Loading listings…</Empty>
          ) : rows.length === 0 ? (
            <Empty>No listings match these filters.</Empty>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {rows.map((e) => (
                <ListingCard key={e.l.id} l={e.l} offers={s.offers} now={now} onOpen={() => setOpenId(e.l.id)} />
              ))}
            </div>
          )}
        </div>
        <aside className="min-w-0">
          <ActivityFeed items={s.activity} now={now} limit={20} />
        </aside>
      </div>

      <ListingModal l={open} offers={s.offers} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
}
