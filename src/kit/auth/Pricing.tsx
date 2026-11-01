"use client";
import { useState } from "react";
import { TIERS, cardReady, cryptoReady, whopUrl, CRYPTO_RECEIVER_EVM, CRYPTO_RECEIVER_SOL, type Tier } from "./payments";
import { useAuth } from "./auth";

export type PayLabels = { card: string; crypto: string; soon: string; cardSoon: string; cryptoSoon: string; perMonth: string; once: string; renew: string; oneTime: string; noEntries: string; login: string };
export const PAY_EN: PayLabels = {
  card: "Pay with card", crypto: "Pay with crypto", soon: "Checkout opening soon", cardSoon: "Card checkout opening soon", cryptoSoon: "Crypto checkout opening soon", perMonth: "/mo", once: "one-time",
  renew: "Renews monthly at {p} until you cancel. Cancel anytime in your account before the next billing date; you keep access until the period ends.",
  oneTime: "One-time payment, no renewal.",
  noEntries: "Paid items never add giveaway entries. No purchase necessary.", login: "Log in to pay with crypto",
};

function PayRow({ t, L }: { t: Tier; L: PayLabels }) {
  const a = useAuth();
  const [msg, setMsg] = useState("");
  const price = `$${t.priceUsd.toFixed(2)}`;
  const payCrypto = async () => {
    if (!a.user) return a.open();
    const to = a.user.chain === "SOL" ? CRYPTO_RECEIVER_SOL : CRYPTO_RECEIVER_EVM;
    if (!a.pay || !to || !t.cryptoAmount) return setMsg(L.soon);
    setMsg("…");
    try { const tx = await a.pay(t.cryptoAmount, to); setMsg(tx ? `✓ ${tx.slice(0, 10)}…` : ""); } catch { setMsg("✕"); }
  };
  return (
    <div className="pay-row">
      {cardReady(t) ? (
        <a className="pay-btn pay-card" href={whopUrl(t.whopPlan)} target="_blank" rel="noopener noreferrer">💳 {L.card}</a>
      ) : (
        <button className="pay-btn pay-card" disabled>💳 {L.cardSoon}</button>
      )}
      {cryptoReady(t) ? (
        <button className="pay-btn pay-crypto" onClick={payCrypto}>🪙 {a.user ? L.crypto : L.login}</button>
      ) : (
        <button className="pay-btn pay-crypto" disabled>🪙 {L.cryptoSoon}</button>
      )}
      <p className="pay-fine">{t.interval === "month" ? L.renew.replace("{p}", `${price}${L.perMonth}`) : L.oneTime} {L.noEntries}</p>
      {msg ? <p className="pay-fine">{msg}</p> : null}
    </div>
  );
}

export function Pricing({ labels = PAY_EN, ids }: { labels?: PayLabels; ids?: string[] }) {
  const tiers = ids ? TIERS.filter((t) => ids.includes(t.id)) : TIERS;
  return (
    <div className="pay-grid">
      {tiers.map((t) => (
        <div key={t.id} className={`pay-card-box pay-${t.id}`}>
          <div className="pay-name">{t.name}</div>
          <div className="pay-price">${t.priceUsd.toFixed(2)}<span>{t.interval === "month" ? labels.perMonth : ` ${labels.once}`}</span></div>
          <ul className="pay-perks">{t.perks.map((p) => <li key={p}>✓ {p}</li>)}</ul>
          <PayRow t={t} L={labels} />
        </div>
      ))}
    </div>
  );
}
