"use client";

import type { ReactNode } from "react";
import { hash } from "@/lib/seed";

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-hot/15 text-hot border border-hot/30 ${className}`}>
      demo data
    </span>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "acid" | "hot" | "warn" | "violet" }) {
  const tones = {
    default: "bg-panel2 border-line text-mute",
    acid: "bg-acid/10 border-acid/30 text-acid",
    hot: "bg-hot/10 border-hot/30 text-hot",
    warn: "bg-amber-400/10 border-amber-400/30 text-amber-300",
    violet: "bg-violet/15 border-violet/30 text-violet-300",
  };
  return <span className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-mute">{label}</div>
      <div className="text-xl font-bold font-mono mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-mute mt-0.5">{sub}</div>}
    </div>
  );
}

export function DomainArt({ title, kind, count }: { title: string; kind: "domain" | "bundle"; count?: number }) {
  const h = hash(title);
  const hue = h % 360;
  const hue2 = (hue + 60 + (h % 90)) % 360;
  const dot = title.indexOf(".");
  const label = kind === "domain" && dot > 0 ? title.slice(0, dot) : title;
  const tld = kind === "domain" && dot > 0 ? title.slice(dot) : "";
  return (
    <div
      className="aspect-[4/3] rounded-xl relative overflow-hidden grid place-items-center p-3"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 18%), hsl(${hue2} 80% 10%))` }}
    >
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-30 blur-xl"
        style={{ background: `hsl(${hue2} 90% 60%)` }}
      />
      <div className="text-center relative">
        <div className={`font-black tracking-tight leading-tight ${title.length > 18 ? "text-base" : title.length > 12 ? "text-lg" : title.length > 9 ? "text-xl" : "text-2xl"}`}>
          <span className="break-all">{label}</span>
          <wbr />
          <span className="text-acid whitespace-nowrap">{tld}</span>
        </div>
        {kind === "bundle" && <div className="text-xs mt-1 text-white/70 font-mono">📦 bundle · {count} names</div>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold break-all">{title}</h2>
          <button onClick={onClose} className="text-mute hover:text-white text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card p-8 text-center text-mute text-sm">{children}</div>;
}
