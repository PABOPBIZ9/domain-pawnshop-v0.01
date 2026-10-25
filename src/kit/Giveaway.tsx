"use client";

import { useState, useSyncExternalStore } from "react";
import { nowMs, useTick } from "@/lib/now";
import { COUNTRIES } from "./countries";
import { etDate, etLong, parts, usd } from "./et";
import type { GiveawayConfig, Prize } from "./types";

/* ---------- per-giveaway local state (v0.01: this browser only) ---------- */
type GState = { joined: boolean; country: string; region: string; claimed: Record<string, string[]> };
const EMPTY: GState = { joined: false, country: "", region: "", claimed: {} };
const caches = new Map<string, GState>();
const subs = new Set<() => void>();
const key = (id: string) => `kit-giveaway:${id}`;
function read(id: string): GState {
  if (typeof window === "undefined") return EMPTY;
  const c = caches.get(id);
  if (c) return c;
  let v = EMPTY;
  try { v = { ...EMPTY, ...(JSON.parse(localStorage.getItem(key(id)) || "null") ?? {}) }; } catch {}
  caches.set(id, v);
  return v;
}
function write(id: string, fn: (s: GState) => GState) {
  const v = fn(read(id));
  caches.set(id, v);
  try { localStorage.setItem(key(id), JSON.stringify(v)); } catch {}
  subs.forEach((l) => l());
}
const subscribe = (l: () => void) => (subs.add(l), () => void subs.delete(l));
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

const VER: Record<string, string> = { verified: "Verified", "self-reported": "Self-reported", auto: "Auto-counted" };

function Art({ p, big }: { p: Prize; big?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-bg ${big ? "h-32 text-5xl" : "h-20 text-3xl"}`}>
      <span aria-hidden>{p.art ?? "🎁"}</span>
      <span className="pill absolute bottom-2 right-2 bg-gold text-black">{usd(p.arv)}{p.qty > 1 ? ` ×${p.qty}` : ""}</span>
    </div>
  );
}

export default function Giveaway({ cfg, member, onJoin, onEnter, verified = {}, shareUrl, demoBoard }: {
  cfg: GiveawayConfig;
  member: { name: string; handle: string } | null;
  onJoin: () => void;
  /** Counts for verified/auto ways, supplied by the app (e.g. { referral: 2, quest: 3 }). */
  verified?: Record<string, number>;
  shareUrl?: string;
  demoBoard?: boolean;
  /** Called once when the member enters. The host app awards the participant badge + points (idempotent). */
  onEnter?: (giveawayId: string) => void;
}) {
  const now = useTick();
  const st = useSyncExternalStore(subscribe, () => read(cfg.id), () => EMPTY);
  const [msg, setMsg] = useState("");
  const start = Date.parse(cfg.startsAt), end = Date.parse(cfg.endsAt);
  const open = !!now && now >= start && now < end;
  const E = cfg.eligibility;
  const allPrizes = cfg.prizes;
  const totalArv = allPrizes.reduce((a, p) => a + p.arv * p.qty, 0) + (cfg.creatorPrize ? cfg.creatorPrize.arv * cfg.creatorPrize.qty : 0);
  const totalQty = allPrizes.reduce((a, p) => a + p.qty, 0) + (cfg.creatorPrize?.qty ?? 0);
  const topSingle = Math.max(0, ...allPrizes.map((p) => p.arv), cfg.creatorPrize?.arv ?? 0);
  const hasPlaceholders = allPrizes.some((p) => p.placeholder);

  const excluded = (c: string, r: string) => !!E.excludedCountries[c] || (!!r && !!E.excludedRegions[r]);
  const needsRegion = !!E.regionRequired[st.country];
  const locOk = !!st.country && (!needsRegion || !!st.region) && !excluded(st.country, st.region);

  const entriesFor = (id: string) => {
    const w = cfg.ways.find((x) => x.id === id)!;
    if (w.verification !== "self-reported") return (verified[id] ?? 0) * w.points;
    return (st.claimed[id]?.length ?? 0) * w.points;
  };
  const yours = st.joined ? 1 + cfg.ways.filter((w) => w.id !== "account").reduce((a, w) => a + entriesFor(w.id), 0) : 0;

  const enter = () => {
    if (!member) return onJoin();
    if (!open) return setMsg("Entries aren't open right now.");
    if (!locOk) return setMsg(excluded(st.country, st.region) ? "Sorry, this giveaway isn't open in your location because of local laws." : "Pick your country (and region) first.");
    write(cfg.id, (s) => ({ ...s, joined: true }));
    onEnter?.(cfg.id);
    setMsg(`You're in! +1 entry, the ${cfg.participant.badge} badge and ${cfg.participant.points.toLocaleString("en-US")} ${cfg.participant.currency}.`);
  };
  const claim = (id: string, perDay?: boolean) => {
    if (!st.joined) return setMsg("Enter the giveaway first.");
    write(cfg.id, (s) => {
      const list = s.claimed[id] ?? [];
      const k = perDay ? dayKey(nowMs()) : "once";
      if (list.includes(k)) return s;
      return { ...s, claimed: { ...s.claimed, [id]: [...list, k] } };
    });
  };
  const claimedToday = (id: string, perDay?: boolean) => {
    const list = st.claimed[id] ?? [];
    return perDay ? !!now && list.includes(dayKey(now)) : list.includes("once");
  };

  const cd = parts(now ? (now < start ? start - now : end - now) : 0);
  const grand = allPrizes.filter((p) => p.tier === "grand"), mid = allPrizes.filter((p) => p.tier === "mid"), bonus = allPrizes.filter((p) => p.tier === "bonus");
  const dn = (() => { try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; } })();
  const cname = (c: string) => { try { return dn?.of(c) ?? c; } catch { return c; } };
  const exclList = [...Object.values(E.excludedRegions), ...Object.values(E.excludedCountries)];

  return (
    <div className="space-y-8">
      {!cfg.rulesReviewed ? (
        <div className="rounded-xl border border-hot/50 bg-hot/10 p-4 text-sm font-bold text-hot" role="alert">
          {cfg.placeholderNotice ?? "DEMO / PLACEHOLDER: these rules and prizes are a template and have not been legally reviewed. Do not treat this as a live promotion."}
        </div>
      ) : null}

      {/* HERO */}
      <section id="gw-home" className="card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase">
              {E.worldwide ? <span className="pill bg-accent text-black">🌍 Worldwide</span> : null}
              <span className="pill bg-hot text-white">🎁 Enter free · {open ? "Live now" : now && now < start ? "Opens soon" : "Entries closed"}</span>
            </div>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] sm:text-5xl">
              {topSingle > 0 ? <>Win up to <span className="text-gold">{usd(topSingle)}</span></> : <>Prizes <span className="text-gold">TBA</span></>}
              <span className="block text-2xl sm:text-3xl">{cfg.name}</span>
            </h1>
            <p className="mt-3 opacity-85">{totalArv > 0 ? usd(totalArv) : "Prize values TBA"} across {totalQty} prizes{cfg.creatorPrize ? `, plus a ${cfg.creatorPrize.title}` : ""}. Everyone who enters gets the {cfg.participant.badge} badge and {cfg.participant.points.toLocaleString("en-US")} {cfg.participant.currency}.</p>
            <p className="mt-2 text-sm">🌍 Open {E.worldwide ? "worldwide " : ""}to {E.minAge}+ (or the age of majority where you live, if older). Void where prohibited.</p>
            <div className="mt-4 rounded-xl border border-hot/40 bg-hot/5 p-3 text-sm"><b>NO PURCHASE NECESSARY.</b> A purchase will not increase your chances of winning. Paid items never add entries.</div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#gw-enter" className="btn btn-primary">{member ? (st.joined ? "Get bonus entries" : "Enter free") : "Create account · enter free"}</a>
              <a href="#gw-rules" className="btn btn-ghost">Official rules</a>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-panel2 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-mute">{now && now < start ? `Opens ${etDate(start)}` : `Entries close ${etDate(end)}`} · ends in</div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {([["d", "days"], ["h", "hrs"], ["m", "min"], ["s", "sec"]] as const).map(([k, l]) => (
                  <div key={k} className="rounded-xl bg-hot py-2 text-white"><div className="font-mono text-3xl font-black tabular-nums">{String(cd[k]).padStart(2, "0")}</div><div className="text-[10px] font-bold uppercase">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-panel2 p-4 text-center"><div className="text-3xl font-black">{yours}</div><div className="text-xs text-mute">entries (this browser)</div></div>
              <div className="rounded-2xl bg-panel2 p-4 text-center"><div className="text-3xl font-black">{st.joined ? 1 : 0}</div><div className="text-xs text-mute">entrants (this browser)</div></div>
            </div>
            <div className="rounded-2xl border border-line p-4">
              <div className="text-xs font-black uppercase tracking-widest text-mute">Your entries</div>
              <div className="text-3xl font-black">{yours}</div>
              {!member ? (
                <>
                  <p className="text-sm text-mute">Create a free account to get your first entry, the {cfg.participant.badge} badge and {cfg.participant.points.toLocaleString("en-US")} {cfg.participant.currency}.</p>
                  <button className="btn btn-primary mt-2 text-sm" onClick={onJoin}>Sign up free · enter</button>
                </>
              ) : !st.joined ? (
                <div className="mt-2 space-y-2">
                  <select className="input" value={st.country} onChange={(e) => write(cfg.id, (s) => ({ ...s, country: e.target.value, region: "" }))} aria-label="Your country / region">
                    <option value="">Your country / region…</option>
                    {COUNTRIES.map((c) => [c, cname(c)] as const).sort((a, b) => a[1].localeCompare(b[1])).map(([c, n]) => <option key={c} value={c}>{n}{E.excludedCountries[c] ? " ✕" : ""}</option>)}
                  </select>
                  {needsRegion ? (
                    <select className="input" value={st.region} onChange={(e) => write(cfg.id, (s) => ({ ...s, region: e.target.value }))} aria-label="Province / region">
                      <option value="">Province / region…</option>
                      {Object.entries(E.regionRequired[st.country]).map(([k, n]) => <option key={k} value={k}>{n}{E.excludedRegions[k] ? " ✕" : ""}</option>)}
                    </select>
                  ) : null}
                  {st.country && excluded(st.country, st.region) ? <p className="text-xs text-hot">Sorry, this giveaway isn&apos;t open in your location because of local laws. Thanks for being here!</p> : null}
                  <button className="btn btn-primary w-full text-sm" onClick={enter} disabled={!locOk}>Enter free (+1)</button>
                </div>
              ) : <p className="text-sm text-accent">✓ You&apos;re entered as @{member.handle}.</p>}
              {msg ? <p className="mt-2 text-xs">{msg}</p> : null}
            </div>
          </div>
        </div>
      </section>

      {/* WAYS */}
      <section id="gw-enter">
        <div className="text-xs font-black uppercase tracking-widest text-accent">Stack entries</div>
        <h2 className="text-3xl font-black">How to enter</h2>
        <p className="text-mute">Every way to enter is free. Entries count only during the entry period.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cfg.ways.map((w) => {
            const isAccount = w.id === "account";
            const done = isAccount ? st.joined : w.verification === "self-reported" ? claimedToday(w.id, w.perDay) : (verified[w.id] ?? 0) > 0;
            return (
              <div key={w.id} className={`rounded-2xl border p-4 ${done ? "border-accent/50 bg-accent/5" : "border-line bg-panel"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="pill bg-gold text-black">{w.value}</span>
                  <span className={`pill ${w.verification === "verified" ? "bg-accent/20 text-accent" : w.verification === "auto" ? "bg-primary/20 text-primary" : "bg-panel2 text-mute"}`}>{VER[w.verification]}</span>
                </div>
                <h3 className="mt-2 font-black">{w.title}</h3>
                <p className="text-sm text-mute">{w.detail}{w.id === "share" && shareUrl ? ` Your link: ${shareUrl.replace(/^https?:\/\//, "")}.` : ""}</p>
                <div className="mt-3">
                  {done ? <span className="text-sm font-bold text-accent">✓ Counted{!isAccount && w.verification !== "self-reported" ? ` (${verified[w.id]})` : ""}</span>
                    : isAccount ? <a href="#gw-home" className="btn btn-primary text-sm">{member ? "Enter" : "Sign up"}</a>
                    : w.verification === "self-reported" ? (
                      w.href ? <a href={w.href} target={w.external ? "_blank" : undefined} rel="noopener noreferrer" className="btn btn-ghost text-sm" onClick={() => claim(w.id, w.perDay)}>{st.joined ? "Tap through" : "Enter first"}</a>
                        : <button className="btn btn-ghost text-sm" onClick={() => claim(w.id, w.perDay)}>{st.joined ? "I did it" : "Enter first"}</button>
                    ) : w.href ? <a href={w.href} className="btn btn-ghost text-sm">Go</a> : null}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-mute">Self-reported follows and shares are click-throughs and are not verified with the platforms. Verified ways are counted by our system. Paid items never add entries.</p>
      </section>

      {/* PRIZES */}
      <section id="gw-prizes">
        <div className="text-xs font-black uppercase tracking-widest text-accent">Prize vault</div>
        <h2 className="text-3xl font-black">Prizes</h2>
        <p className="text-mute">Total ARV {totalArv > 0 ? usd(totalArv) : "TBA"} across {totalQty} prizes.{cfg.giftCardNote ? ` ${cfg.giftCardNote}` : ""}</p>
        {hasPlaceholders ? <p className="mt-2 rounded-lg bg-gold/15 p-2 text-sm font-bold text-gold">TODO: prizes marked PLACEHOLDER are not committed. Replace them with confirmed prizes and ARVs before launch.</p> : null}
        {[["Grand prizes", grand, true], ["Runner-ups", mid, false], ["Bonus prizes", bonus, false]].map(([title, list, big]) =>
          (list as Prize[]).length ? (
            <div key={title as string} className="mt-5">
              <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-mute">{title as string}</h3>
              <div className={`grid gap-3 ${big ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                {(list as Prize[]).map((p) => (
                  <div key={p.place + p.title} className="card p-3">
                    <Art p={p} big={big as boolean} />
                    <div className="mt-2 flex items-center gap-2 text-xs font-black uppercase text-mute">{p.place}{p.qty > 1 ? ` · ×${p.qty}` : ""}{p.placeholder ? <span className="pill bg-gold/20 text-gold">PLACEHOLDER</span> : null}</div>
                    <div className="font-black">{p.title}</div>
                    <p className="text-sm text-mute">{p.detail}</p>
                    <div className="mt-1 text-xs">ARV {usd(p.arv)}{p.qty > 1 ? " each" : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null,
        )}
        {cfg.creatorPrize ? (
          <div className="card mt-5 flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="max-w-2xl">
              <div className="text-xs font-black uppercase tracking-widest text-primary">🎬 For creators</div>
              <h3 className="text-xl font-black">{cfg.creatorPrize.title}</h3>
              <p className="text-sm opacity-85">{cfg.creatorPrize.detail} Judged on {cfg.creatorPrize.judging}, not views or followers.</p>
              <p className="mt-1 text-sm"><b>Prize:</b> {cfg.creatorPrize.prize} · ARV {usd(cfg.creatorPrize.arv)}</p>
            </div>
            <a href={cfg.creatorPrize.href} className="btn btn-primary">Submit a clip</a>
          </div>
        ) : null}
        <p className="mt-4 rounded-xl bg-panel2 p-3 text-sm">{cfg.participant.emoji} <b>Everyone wins something:</b> the {cfg.participant.badge} badge + {cfg.participant.points.toLocaleString("en-US")} {cfg.participant.currency} for every entrant. {cfg.participant.currency} is free, for fun and has no cash value.</p>
      </section>

      {/* BOARD */}
      <section id="gw-board">
        <div className="text-xs font-black uppercase tracking-widest text-accent">Live board</div>
        <h2 className="text-3xl font-black">Top entrants</h2>
        <p className="text-mute">Most free entries so far. More entries = better odds, not a guaranteed win.</p>
        <div className="card mt-3 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-left text-mute"><tr><th className="p-2 w-12">#</th><th className="p-2">Entrant</th><th className="p-2 text-right">Entries</th></tr></thead>
            <tbody>
              {st.joined && member ? (
                <tr className="border-t border-line"><td className="p-2">1</td><td className="p-2 font-bold">@{member.handle} (you)</td><td className="p-2 text-right font-black">{yours}</td></tr>
              ) : (
                <tr><td colSpan={3} className="p-4 text-center text-mute">No entrants yet. Be the first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {demoBoard !== false ? <p className="mt-2 text-xs text-mute">v0.01 shows this browser only. The public board needs the accounts backend.</p> : null}
      </section>

      {/* FAQ */}
      <section id="gw-faq">
        <div className="text-xs font-black uppercase tracking-widest text-accent">Read before entering</div>
        <h2 className="text-3xl font-black">FAQ</h2>
        <div className="mt-3 space-y-2">
          {cfg.faq.map((f) => (
            <details key={f.q} className="card p-4"><summary className="cursor-pointer font-bold">{f.q}</summary><p className="mt-2 text-sm text-mute">{f.a}</p></details>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-hot/40 bg-hot/5 p-3 text-sm"><b>NO PURCHASE NECESSARY.</b> A purchase will not increase your chances of winning. Paid items never add entries.</div>
        <p className="mt-2 text-xs text-mute">🌐 Translations are for convenience; the English Official Rules control.</p>
      </section>

      {/* RULES */}
      <section id="gw-rules" className="card p-6 text-sm leading-relaxed">
        <h2 className="text-2xl font-black">Official Rules · {cfg.name}</h2>
        {!cfg.rulesReviewed ? <p className="mt-2 rounded-lg bg-hot/10 p-2 font-bold text-hot">Template generated from config. Not legally reviewed.</p> : null}
        <div className="mt-4 space-y-3 opacity-90">
          <p><b>1. NO PURCHASE NECESSARY TO ENTER OR WIN.</b> A purchase or payment of any kind will not increase your chances of winning. Void where prohibited.</p>
          <p><b>2. Sponsor.</b> {cfg.sponsor}. Contact: <a className="underline" href={`mailto:${cfg.sponsorEmail}`}>{cfg.sponsorEmail}</a>.</p>
          <p><b>3. Eligibility{E.worldwide ? " (worldwide)" : ""}.</b> Open to legal residents{E.worldwide ? " of any country or territory" : ""} who are at least {E.minAge} years old or the age of majority in their jurisdiction, whichever is older, at the time of entry.{exclList.length ? <> <b>Not open to</b> residents of: {exclList.join(", ")}; or {E.otherExcluded}.</> : ` Not open in ${E.otherExcluded}.`} Countries and regions under U.S. sanctions are excluded. Void where prohibited or restricted by law. Entrants select their country (and province/region where needed); entries from excluded locations are blocked and void. Employees of the Sponsor and their immediate families are not eligible.</p>
          <p><b>4. Entry period.</b> Begins {etLong(start)} and ends {etLong(end)} (the &quot;Entry Period&quot;). Entries outside the Entry Period are not counted.</p>
          <p><b>5. How to enter.</b> Create a free {cfg.siteName} and tap &quot;Enter&quot; for 1 entry. Optional free bonus entries: {cfg.ways.filter((w) => w.id !== "account").map((w) => `${w.title.replace(/\.$/, "")} (${w.value}, ${VER[w.verification].toLowerCase()}${w.id === "referral" ? `, max ${cfg.referralCap} friends` : ""}${w.id === "quest" ? `, max ${cfg.questDailyCap} per day` : ""})`).join("; ")}. Self-reported entries are counted when you tap through and are not verified. One account per person. Automated, duplicate or fake accounts are void and may be disqualified with all entries.</p>
          <p><b>6. Drawing &amp; odds.</b> Within {cfg.drawWithinDays} days after the Entry Period ends (by {etDate(end + cfg.drawWithinDays * 864e5, "long")}), winners will be selected in a random drawing from all eligible entries, in this order: grand prizes, then runner-ups, then bonus prizes, each in the order listed in section 8. Each entry is one chance; one prize per person{cfg.creatorPrize ? ` (excluding the ${cfg.creatorPrize.title})` : ""}. Odds of winning depend on the total number of eligible entries received.</p>
          <p><b>7. Notification.</b> Winners are notified by the email on their account and on-site. Winners must respond within {cfg.claimDays} days and may be asked to sign an affidavit of eligibility and release; otherwise an alternate winner may be drawn.</p>
          <p><b>8. Prizes &amp; ARV.</b> {allPrizes.map((p) => `${p.place}: ${p.title} (qty ${p.qty}, ARV ${usd(p.arv)} each)${p.placeholder ? " [PLACEHOLDER]" : ""}`).join("; ")}.{cfg.creatorPrize ? ` ${cfg.creatorPrize.title}: ${cfg.creatorPrize.prize} (qty ${cfg.creatorPrize.qty}, ARV ${usd(cfg.creatorPrize.arv)}).` : ""} Total ARV of all prizes: {usd(totalArv)} across {totalQty} prizes. {cfg.giftCardNote ?? ""} No substitution or transfer except by Sponsor, which may substitute a prize of equal or greater value. All ARVs are in U.S. dollars. If a prize cannot legally or practically be delivered to a winner&apos;s country, Sponsor may award a gift card or cash equivalent of equal ARV instead. Winners are responsible for all local taxes, duties, customs fees and import charges.</p>
          <p><b>8a. Skill-testing question.</b> Where required by law (including {E.skillQuestionCountries.map(cname).join(", ") || "Canada"}), a selected winner must correctly answer, without assistance, a time-limited mathematical skill-testing question (for example: (12 × 4) + 18 ÷ 3 − 7 = ?) before being confirmed as a winner.</p>
          {cfg.creatorPrize ? <p><b>9. {cfg.creatorPrize.title}.</b> A separate skill-based award. Submit an original public entry during the Entry Period. Judged by the Sponsor on {cfg.creatorPrize.judging}, not views or followers. Free to enter.</p> : null}
          <p><b>{cfg.creatorPrize ? 10 : 9}. Participant rewards.</b> Every eligible entrant receives the virtual &quot;{cfg.participant.badge}&quot; badge and {cfg.participant.points.toLocaleString("en-US")} {cfg.participant.currency}. Badges and {cfg.participant.currency} are free, for fun, have no cash value and are not exchangeable for prizes.</p>
          <p><b>{cfg.creatorPrize ? 11 : 10}. Not affiliated.</b> This promotion is not sponsored, endorsed or administered by, or associated with, {cfg.notAffiliated.join(", ")}. Third-party names identify prizes or platforms only; no third-party logos are used.</p>
          <p><b>{cfg.creatorPrize ? 12 : 11}. Language.</b> These rules may be shown in translation for convenience; if there is any conflict, the English version controls.</p>
          <p><b>{cfg.creatorPrize ? 13 : 12}. General.</b> By entering, you agree to these rules and the Sponsor&apos;s decisions. Sponsor may cancel or modify the promotion if fraud or technical failure compromises it. Winners list: email {cfg.sponsorEmail} within 30 days after the drawing.</p>
        </div>
      </section>
    </div>
  );
}
