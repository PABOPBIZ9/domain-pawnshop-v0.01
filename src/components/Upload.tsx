"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parsePortfolio, SAMPLE_CSV } from "@/lib/csv";
import { addToPortfolio } from "@/lib/store";
import { useNow } from "@/lib/now";
import { isValidDomain, normalizeDomain, usd, valuate } from "@/lib/valuation";
import { Chip } from "./ui";
import { UrgencyChip, ValuationBreakdown } from "./Valuation";

export function Upload() {
  const now = useNow();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [quick, setQuick] = useState("pawnloop.com");
  const rows = useMemo(() => parsePortfolio(text), [text]);
  const valid = rows.filter((r) => !r.error);
  const vals = valid.map((r) => ({ r, v: valuate(r.domain, r.expiry, now || Date.parse("2026-01-01")) }));
  const totals = vals.reduce((t, { v }) => ({ low: t.low + v.low, high: t.high + v.high, pawn: t.pawn + v.pawnOffer, buy: t.buy + v.buyout }), {
    low: 0,
    high: 0,
    pawn: 0,
    buy: 0,
  });
  const qd = normalizeDomain(quick);
  const qv = isValidDomain(qd) && now ? valuate(qd, "", now) : null;

  function onFile(f: File | undefined) {
    if (!f) return;
    f.text().then((t) => {
      setText(t);
      setMsg(`Loaded ${f.name}`);
    });
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shotclock-sample.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function add() {
    const n = addToPortfolio(valid);
    setMsg(n ? `✓ Added ${n} domain${n > 1 ? "s" : ""} to your portfolio.` : "Nothing new to add (duplicates skipped).");
    if (n) setText("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Upload & value your portfolio</h1>
        <p className="text-mute text-sm mt-1">
          Paste a list or drop a CSV exported from GoDaddy, Namecheap, Dynadot, Unstoppable Domains or anywhere else. Everything stays in your browser.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="font-bold">1. Paste or upload</h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost text-xs" onClick={() => setText(SAMPLE_CSV)}>
                Use sample
              </button>
              <button className="btn btn-ghost text-xs" onClick={downloadSample}>
                Download template
              </button>
              <label className="btn btn-violet text-xs">
                Upload CSV
                <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <textarea
            className="input w-full h-64 font-mono text-xs"
            placeholder={"domain,registrar,expiry,cost_basis\nexample.com,GoDaddy,2027-01-31,12\n\n…or just one domain per line"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-[11px] text-mute">
            Columns: <code>domain</code>, <code>registrar</code> (GoDaddy / Namecheap / Dynadot / Unstoppable / Other), <code>expiry</code> (YYYY-MM-DD or
            MM/DD/YYYY), optional <code>cost_basis</code>. Header row optional.
          </p>
          <div className="flex items-center gap-3">
            <button className="btn btn-acid" disabled={!valid.length} onClick={add}>
              Add {valid.length || ""} to portfolio
            </button>
            {msg && <span className="text-sm text-mute">{msg}</span>}
            {msg.startsWith("✓") && (
              <Link href="/dashboard" className="text-sm text-acid underline">
                Open dashboard →
              </Link>
            )}
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="font-bold">Quick check one name</h2>
          <input className="input w-full font-mono" value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="yourname.com" />
          {qv ? <ValuationBreakdown v={qv} /> : <p className="text-sm text-mute">Enter a valid domain like brand.com</p>}
        </div>
      </div>

      {rows.length > 0 && (
        <div className="card p-4 space-y-3">
          <div className="flex flex-wrap justify-between gap-3 items-end">
            <h2 className="font-bold">2. Preview — {valid.length} valid{rows.length - valid.length ? `, ${rows.length - valid.length} invalid` : ""}</h2>
            <div className="flex gap-2 flex-wrap text-sm">
              <Chip>Range {usd(totals.low)} – {usd(totals.high)}</Chip>
              <Chip tone="acid">Pawn total {usd(totals.pawn)}</Chip>
              <Chip tone="violet">Buyout total {usd(totals.buy)}</Chip>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-mute">
                <tr className="text-left">
                  <th className="py-2 pr-3">Domain</th>
                  <th className="pr-3">Registrar</th>
                  <th className="pr-3">Expiry</th>
                  <th className="pr-3">Category</th>
                  <th className="pr-3 text-right">Range</th>
                  <th className="pr-3 text-right">Pawn</th>
                  <th className="text-right">Buyout</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const v = r.error ? null : valuate(r.domain, r.expiry, now || Date.parse("2026-01-01"));
                  return (
                    <tr key={r.domain} className="border-t border-line">
                      <td className="py-2 pr-3 font-mono">{r.domain || "(blank)"}</td>
                      <td className="pr-3">{r.registrar}</td>
                      <td className="pr-3">
                        <span className="mr-2">{r.expiry || "—"}</span>
                        {v && <UrgencyChip v={v} />}
                      </td>
                      <td className="pr-3">{v ? v.category : <Chip tone="hot">{r.error}</Chip>}</td>
                      <td className="pr-3 text-right font-mono">{v ? `${usd(v.low)}–${usd(v.high)}` : "—"}</td>
                      <td className="pr-3 text-right font-mono text-acid">{v ? usd(v.pawnOffer) : "—"}</td>
                      <td className="text-right font-mono">{v ? usd(v.buyout) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="card p-5 text-sm space-y-2">
      <h2 className="font-bold text-base">How the v0.01 valuation heuristic works</h2>
      <ol className="list-decimal pl-5 space-y-1 text-mute">
        <li>
          <b className="text-white">Length base:</b> 2 chars $25k · 3 $6k · 4 $1.8k · 5 $900 · 6 $500 · 7 $320 · 8 $220 · 9–10 $140 · 11–14 $70 · 15+ $25.
        </li>
        <li>
          <b className="text-white">TLD multiplier:</b> .com ×1 · .ai ×0.8 · .io ×0.55 · .co ×0.45 · .net/.org/.app ×0.35 · Web3 (.crypto, .nft, .x, .eth…)
          ×0.12–0.3 · long-tail ×0.1.
        </li>
        <li>
          <b className="text-white">Words:</b> single dictionary word ×3 · two-word combo ×1.8 · three words ×1.2 · pronounceable brandable ×1.3 · awkward ×0.4.
        </li>
        <li>
          <b className="text-white">Penalties/premiums:</b> 1 hyphen ×0.4, 2+ ×0.2 · digits mixed in ×0.5 · short all-numeric ×1.5 · hot keyword ×1.25.
        </li>
        <li>
          <b className="text-white">Range:</b> low = 0.6 × value, high = 1.6 × value, rounded.
        </li>
        <li>
          <b className="text-white">Liquidity offers:</b> instant pawn = low × LTV (30% normal, 22% if ≤60d to expiry, 15% if ≤14d, 10% if expired, +5% if
          score ≥70). Instant buyout = low × 55% / 48% / 40% / 30% on the same urgency scale.
        </li>
      </ol>
      <p className="text-[11px] text-mute">Indicative heuristic only — not an appraisal, not financial advice, not a binding offer.</p>
    </div>
  );
}
