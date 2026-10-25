import type { Metadata } from "next";
import { points } from "@/config/social";

export const metadata: Metadata = { title: "Terms · SHOTCLOCK" };

export default function Page() {
  return (
    <article className="max-w-3xl space-y-4 text-sm leading-relaxed">
      <h1 className="text-3xl font-black">Terms of Use (v0.01 template)</h1>
      <p className="text-hot font-bold">Template: have this reviewed before launch.</p>
      <p>SHOTCLOCK v0.01 is a prototype. Prices are indicative heuristics, not appraisals. Offers, bids and sales are simulated; no real payments, escrow or domain transfers happen here. Anything marked DEMO DATA is simulated.</p>
      <p>{points.disclaimer}</p>
      <p>You must be 18+ (or the age of majority where you live) to join. Giveaways have their own Official Rules on the giveaway page. No purchase is ever necessary.</p>
      <p>Domain names shown belong to their registrants. SHOTCLOCK is not affiliated with any registrar.</p>
    </article>
  );
}
