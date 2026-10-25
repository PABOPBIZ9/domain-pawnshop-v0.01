"use client";

import type { Valuation } from "@/lib/valuation";
import { usd } from "@/lib/valuation";
import { Chip } from "./ui";
import { tierForDays, TIER_META } from "@/lib/shotclock";

export function UrgencyChip({ v }: { v: Pick<Valuation, "urgency" | "daysToExpiry"> }) {
  const d = v.daysToExpiry;
  const tier = tierForDays(d);
  if (d === null || tier === "LATER" || tier === "UNKNOWN") return null;
  const meta = TIER_META[tier];
  return <Chip tone={meta.tone}>{d < 0 ? `${meta.short} · ${-d}d past` : `${meta.short} · ${d}d left`}</Chip>;
}

export function ValuationBreakdown({ v, compact = false }: { v: Valuation; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Box label="Indicative range" value={`${usd(v.low)} – ${usd(v.high)}`} />
        <Box label="Score" value={`${v.score}/100`} />
        <Box label={`Instant pawn (${Math.round(v.ltv * 100)}% LTV)`} value={usd(v.pawnOffer)} accent />
        <Box label="Instant buyout" value={usd(v.buyout)} accent />
      </div>
      {!compact && (
        <div className="rounded-xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-mute text-[11px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-2">Factor</th>
                <th className="text-left px-3 py-2">Detail</th>
                <th className="text-right px-3 py-2">Effect</th>
              </tr>
            </thead>
            <tbody>
              {v.factors.map((f) => (
                <tr key={f.label} className="border-t border-line">
                  <td className="px-3 py-2 font-medium">{f.label}</td>
                  <td className="px-3 py-2 text-mute">{f.detail}</td>
                  <td className={`px-3 py-2 text-right font-mono ${f.multiplier === null ? "text-mute" : f.multiplier >= 1 ? "text-acid" : "text-hot"}`}>
                    {f.multiplier === null ? "—" : `×${f.multiplier}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-mute">
        ⚠️ Indicative heuristic, not an appraisal. Deterministic formula based on length, TLD, words, hyphens/digits and expiry. Pawn = low × LTV;
        buyout = low × urgency-adjusted multiple.
      </p>
    </div>
  );
}

function Box({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-panel2 border border-line px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mute">{label}</div>
      <div className={`font-mono font-bold ${accent ? "text-acid" : ""}`}>{value}</div>
    </div>
  );
}
