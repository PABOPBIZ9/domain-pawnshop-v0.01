"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { delist, listDomain, loadSamplePortfolio, removeFromPortfolio, resetAll, respondOffer, useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { usd, valuate, type Valuation } from "@/lib/valuation";
import type { PortfolioDomain } from "@/lib/types";
import { Chip, DemoBadge, Empty, Modal, Stat } from "./ui";
import { UrgencyChip, ValuationBreakdown } from "./Valuation";
import { PriceForm } from "./Bundles";

export function Dashboard() {
  const s = useStore();
  const now = useNow();
  const [sel, setSel] = useState<string[]>([]);
  const [listFor, setListFor] = useState<{ p: PortfolioDomain; v: Valuation } | null>(null);
  const [detail, setDetail] = useState<Valuation | null>(null);
  const [msg, setMsg] = useState("");

  const vals = useMemo(() => s.portfolio.map((p) => ({ p, v: valuate(p.domain, p.expiry, now) })), [s.portfolio, now]);
  const myListings = s.listings.filter((l) => l.mine);
  const activeMine = myListings.filter((l) => l.status === "active");
  const listedDomains = new Set(activeMine.flatMap((l) => l.domains));
  const myListingIds = new Set(myListings.map((l) => l.id));
  const received = s.offers.filter((o) => myListingIds.has(o.listingId) && !o.mine).sort((a, b) => b.createdAt - a.createdAt);
  const pendingReceived = received.filter((o) => o.status === "pending");
  const myBids = s.offers.filter((o) => o.mine);
  const expiring = vals.filter(({ v }) => v.daysToExpiry !== null && v.daysToExpiry <= 60).sort((a, b) => (a.v.daysToExpiry ?? 0) - (b.v.daysToExpiry ?? 0));
  const tot = vals.reduce((t, { v }) => ({ low: t.low + v.low, high: t.high + v.high, pawn: t.pawn + v.pawnOffer, buy: t.buy + v.buyout }), { low: 0, high: 0, pawn: 0, buy: 0 });
  const titleOf = (id: string) => s.listings.find((l) => l.id === id)?.title ?? "?";
  const allSel = vals.length > 0 && sel.length === vals.length;

  function bulkList() {
    let n = 0;
    for (const { p, v } of vals) {
      if (!sel.includes(p.id) || listedDomains.has(p.domain)) continue;
      listDomain(p.domain, Math.max(v.mid, v.buyout * 2), v.buyout);
      n++;
    }
    setSel([]);
    setMsg(`✓ Listed ${n} domain${n === 1 ? "" : "s"} at suggested prices. Simulated demo offers incoming below.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Seller dashboard</h1>
          <p className="text-mute text-sm mt-1">Your portfolio, expiring names, listings and offers. Stored only in this browser.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload" className="btn btn-acid text-sm">
            + Upload domains
          </Link>
          <button
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (confirm("Reset all local data and re-seed demo listings?")) resetAll(true);
            }}
          >
            Reset data
          </button>
        </div>
      </div>

      {msg && <div className="rounded-xl border border-acid/40 bg-acid/10 text-acid p-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Portfolio" value={vals.length} sub={`${listedDomains.size} listed`} />
        <Stat label="Indicative value" value={vals.length ? `${usd(tot.low)}+` : "—"} sub={vals.length ? `up to ${usd(tot.high)}` : undefined} />
        <Stat label="Instant pawn total" value={usd(tot.pawn)} />
        <Stat label="Instant buyout total" value={usd(tot.buy)} />
        <Stat label="Offers pending" value={pendingReceived.length} />
      </div>

      {expiring.length > 0 && (
        <div className="card p-4 border-hot/40">
          <div className="flex items-center gap-2 mb-2">
            <span>⏳</span>
            <h2 className="font-bold">Expiring-soon alerts</h2>
            <Chip tone="hot">{expiring.length}</Chip>
          </div>
          <p className="text-xs text-mute mb-3">These names expire within 60 days (or already have). Renew, pawn, or list them before they drop.</p>
          <div className="flex flex-wrap gap-2">
            {expiring.map(({ p, v }) => (
              <div key={p.id} className="flex items-center gap-2 bg-panel2 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-mono">{p.domain}</span>
                <UrgencyChip v={v} />
                <span className="text-xs text-mute">pawn {usd(v.pawnOffer)}</span>
                {!listedDomains.has(p.domain) && (
                  <button className="text-acid text-xs underline" onClick={() => setListFor({ p, v })}>
                    list
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="card p-4 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="font-bold">My portfolio</h2>
          <div className="flex gap-2 text-sm">
            <button className="btn btn-violet text-xs" disabled={!sel.length} onClick={bulkList}>
              List {sel.length || ""} at suggested
            </button>
            <Link href="/bundles" className="btn btn-ghost text-xs">
              Bundle names
            </Link>
            <button
              className="btn btn-ghost text-xs"
              disabled={!sel.length}
              onClick={() => {
                removeFromPortfolio(sel);
                setSel([]);
              }}
            >
              Remove
            </button>
          </div>
        </div>
        {!s.hydrated ? (
          <Empty>Loading…</Empty>
        ) : vals.length === 0 ? (
          <Empty>
            No domains yet. <Link className="text-acid underline" href="/upload">Upload a CSV or paste a list</Link>, or{" "}
            <button className="text-acid underline" onClick={() => loadSamplePortfolio()}>
              load a sample portfolio
            </button>
            .
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-mute">
                <tr className="text-left">
                  <th className="py-2 pr-2">
                    <input type="checkbox" aria-label="Select all" checked={allSel} onChange={() => setSel(allSel ? [] : vals.map((x) => x.p.id))} />
                  </th>
                  <th className="pr-3">Domain</th>
                  <th className="pr-3">Registrar</th>
                  <th className="pr-3">Expiry</th>
                  <th className="pr-3">Category</th>
                  <th className="pr-3 text-right">Range</th>
                  <th className="pr-3 text-right">Pawn</th>
                  <th className="pr-3 text-right">Buyout</th>
                  <th className="pr-3 text-right">Cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vals.map(({ p, v }) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.domain}`}
                        checked={sel.includes(p.id)}
                        onChange={() => setSel(sel.includes(p.id) ? sel.filter((x) => x !== p.id) : [...sel, p.id])}
                      />
                    </td>
                    <td className="pr-3 font-mono">
                      <button className="hover:text-acid" onClick={() => setDetail(v)}>
                        {p.domain}
                      </button>
                    </td>
                    <td className="pr-3">{p.registrar}</td>
                    <td className="pr-3 whitespace-nowrap">
                      <span className="mr-2">{p.expiry || "—"}</span>
                      <UrgencyChip v={v} />
                    </td>
                    <td className="pr-3">{v.category}</td>
                    <td className="pr-3 text-right font-mono whitespace-nowrap">
                      {usd(v.low)}–{usd(v.high)}
                    </td>
                    <td className="pr-3 text-right font-mono text-acid">{usd(v.pawnOffer)}</td>
                    <td className="pr-3 text-right font-mono">{usd(v.buyout)}</td>
                    <td className="pr-3 text-right font-mono text-mute">{p.costBasis !== undefined ? usd(p.costBasis) : "—"}</td>
                    <td className="text-right">
                      {listedDomains.has(p.domain) ? (
                        <Chip tone="acid">listed</Chip>
                      ) : (
                        <button className="btn btn-ghost text-xs" onClick={() => setListFor({ p, v })}>
                          List
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card p-4 space-y-3">
          <h2 className="font-bold">Offers received</h2>
          {received.length === 0 ? (
            <p className="text-sm text-mute">List a domain or bundle to start receiving (simulated) offers.</p>
          ) : (
            <ul className="space-y-2">
              {received.map((o) => (
                <li key={o.id} className="bg-panel2 rounded-lg px-3 py-2 flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="truncate">
                      <span className="font-mono">{o.from}</span> <span className="text-mute">{o.type} on</span> {titleOf(o.listingId)}
                    </div>
                    <div className="flex gap-2 items-center mt-0.5">
                      <span className="font-mono font-bold">{usd(o.amount)}</span>
                      {o.demo && <DemoBadge />}
                    </div>
                  </div>
                  {o.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <button className="btn btn-acid text-xs" onClick={() => respondOffer(o.id, true)}>
                        Accept
                      </button>
                      <button className="btn btn-ghost text-xs" onClick={() => respondOffer(o.id, false)}>
                        Decline
                      </button>
                    </div>
                  ) : (
                    <Chip tone={o.status === "accepted" ? "acid" : "default"}>{o.status}</Chip>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-mute">Simulated offers are auto-generated demo data so you can test the flow. Accepting simulates a sale — no money moves.</p>
        </section>

        <section className="space-y-6">
          <div className="card p-4 space-y-3">
            <h2 className="font-bold">My listings</h2>
            {myListings.length === 0 ? (
              <p className="text-sm text-mute">Nothing listed yet.</p>
            ) : (
              <ul className="space-y-2">
                {myListings.map((l) => (
                  <li key={l.id} className="bg-panel2 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">
                      {l.kind === "bundle" ? "📦 " : ""}
                      {l.title}
                    </span>
                    <span className="font-mono">{usd(l.price)}</span>
                    <Chip tone={l.status === "active" ? "acid" : "default"}>{l.status}</Chip>
                    {l.status === "active" && (
                      <button className="text-xs text-mute underline" onClick={() => delist(l.id)}>
                        delist
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-4 space-y-3">
            <h2 className="font-bold">My bids & offers</h2>
            {myBids.length === 0 ? (
              <p className="text-sm text-mute">
                You haven&apos;t bid on anything. <Link className="text-acid underline" href="/market">Browse the marketplace</Link>.
              </p>
            ) : (
              <ul className="space-y-2">
                {myBids.map((o) => (
                  <li key={o.id} className="bg-panel2 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">
                      {o.type} on {titleOf(o.listingId)}
                    </span>
                    <span className="font-mono">{usd(o.amount)}</span>
                    <Chip>{o.status}</Chip>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <Modal open={!!listFor} onClose={() => setListFor(null)} title={listFor ? `List ${listFor.p.domain}` : ""}>
        {listFor && (
          <div className="space-y-4">
            <ValuationBreakdown v={listFor.v} compact />
            <PriceForm
              key={listFor.p.id}
              suggested={Math.max(listFor.v.mid, listFor.v.buyout * 2)}
              onSubmit={(price, minBid) => {
                listDomain(listFor.p.domain, price, minBid);
                setMsg(`✓ ${listFor.p.domain} listed. Simulated demo offers will appear under Offers received.`);
                setListFor(null);
              }}
            />
          </div>
        )}
      </Modal>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.domain ?? ""}>
        {detail && <ValuationBreakdown v={detail} />}
      </Modal>
    </div>
  );
}
