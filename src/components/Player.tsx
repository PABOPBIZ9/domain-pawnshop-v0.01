"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { points } from "@/config/social";
import { funName, newSeed } from "@/lib/identity";
import { claimVisit, dayKeyOf, join, JOIN_EVENT, shuffle, usePlayer } from "@/lib/player";
import { earlyBird } from "@/config/site";
import { useNow } from "@/lib/now";
import { Avatar } from "./Avatar";

function Row({ reward, action, verify, done, button }: { reward: string; action: string; verify: string; done?: boolean; button?: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${done ? "border-acid/40 bg-acid/5" : "border-line bg-panel2"}`}>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${done ? "bg-acid text-black" : "bg-violet/20 text-violet"}`}>{reward}</span>
      <div className="min-w-0 flex-1"><div className="font-bold leading-tight">{action}{done ? " ✓" : ""}</div><div className="text-xs text-mute">{verify}</div></div>
      {button}
    </div>
  );
}

/** Header chip + join / points panel (ported from DOU STARTER KIT). */
export function PlayerChip() {
  const { player } = usePlayer();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ seed: number; name: string } | null>(null);
  const [age, setAge] = useState(false);
  const now = useNow();
  const visitDone = !!player && player.visitClaimed && !!now && player.dayKey === dayKeyOf(now);
  const start = () => { const seed = newSeed(); setDraft({ seed, name: funName(seed) }); setOpen(true); };
  useEffect(() => {
    const onJoin = () => { const seed = newSeed(); setDraft({ seed, name: funName(seed) }); setOpen(true); };
    window.addEventListener(JOIN_EVENT, onJoin);
    return () => window.removeEventListener(JOIN_EVENT, onJoin);
  }, []);
  const ogOpen = earlyBird.enabled && !!now && now <= Date.parse(earlyBird.endsAt);
  const shown = (player?.badges ?? []).filter((b) => !b.startsWith("giveaway:"));
  return (
    <>
      {player ? (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-panel2" title={points.disclaimer}>
          <Avatar seed={player.seed} size={28} />
          <span className="hidden lg:inline text-xs font-bold">#{player.number}</span>
          <span className="text-xs font-mono tabular-nums whitespace-nowrap">{player.balance.toLocaleString("en-US")} {points.short}</span>
        </button>
      ) : (
        <button onClick={start} className="btn btn-ghost text-sm whitespace-nowrap">Join free</button>
      )}
      {open ? createPortal(
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-black">{player ? `#${player.number} ${player.name}` : "Claim your spot"}</h2>
              <button onClick={() => setOpen(false)} className="text-mute" aria-label="Close">✕</button>
            </div>
            {player ? (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar seed={player.seed} size={80} />
                  <div>
                    <div className="text-2xl font-black">{player.balance.toLocaleString("en-US")} {points.short}</div>
                    <button className="btn btn-ghost text-sm mt-1" onClick={shuffle}>🎲 Shuffle avatar</button>
                  </div>
                </div>
                {shown.length ? <div className="mt-3 flex flex-wrap gap-1.5">{shown.map((b) => <span key={b} className="pill bg-gold/20 text-gold">🏅 {b}</span>)}</div> : null}
                <div className="mt-4 space-y-2">
                  <Row reward={`+${points.dailyVisit}`} action="Daily check-in" verify="Once a day." done={visitDone}
                    button={!visitDone ? <button className="btn btn-acid text-xs" onClick={claimVisit}>Claim</button> : undefined} />
                  <Row reward={`+${points.offer}`} action="Make an offer, bid or buy" verify={`Auto-counted on simulated deals. ${now && player.dayKey === dayKeyOf(now) ? player.offersToday : 0}/${points.offerDailyCap} today.`} done={player.offersToday >= points.offerDailyCap} />
                </div>
              </>
            ) : draft ? (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar seed={draft.seed} size={80} />
                  <div className="flex-1 min-w-0">
                    <input className="input w-full" value={draft.name} maxLength={32} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-label="Fun name" />
                    <button className="btn btn-ghost text-sm mt-2" onClick={() => { const seed = newSeed(); setDraft({ seed, name: funName(seed) }); }}>🎲 Shuffle</button>
                  </div>
                </div>
                <label className="mt-4 flex gap-2 text-sm items-start"><input type="checkbox" className="mt-1" checked={age} onChange={(e) => setAge(e.target.checked)} />I&apos;m 18+ (or the age of majority where I live).</label>
                {ogOpen ? <p className="mt-3 text-sm text-gold">🐣 Early-bird: join now for the {earlyBird.badge} badge and +{earlyBird.bonusPoints} bonus {points.short}.</p> : null}
                <button className="btn btn-acid w-full mt-4" disabled={!age} onClick={() => join(draft.name.trim() || "Player", draft.seed)}>Join (+{points.join + (ogOpen ? earlyBird.bonusPoints : 0)} {points.short})</button>
              </>
            ) : null}
            <p className="mt-4 text-xs text-mute">{points.disclaimer}</p>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
