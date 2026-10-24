"use client";

import type { Activity } from "@/lib/types";
import { usd } from "@/lib/valuation";
import { ago } from "@/lib/now";
import { DemoBadge } from "./ui";

const ICON: Record<Activity["type"], string> = {
  list: "🏷️",
  bid: "🔨",
  offer: "💬",
  sale: "💸",
  accept: "✅",
  decline: "✖️",
  delist: "↩️",
  upload: "📥",
};

export function ActivityFeed({ items, now, limit = 15 }: { items: Activity[]; now: number; limit?: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Activity</h3>
        <span className="text-[11px] text-mute">local + demo</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-mute">Nothing yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, limit).map((a) => (
            <li key={a.id} className="flex gap-2 text-sm">
              <span>{ICON[a.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="truncate">{a.text}</div>
                <div className="text-[11px] text-mute flex gap-2 items-center">
                  {a.amount !== undefined && <span className="font-mono text-white/80">{usd(a.amount)}</span>}
                  <span>{ago(a.createdAt, now)}</span>
                  {a.demo && <DemoBadge />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
