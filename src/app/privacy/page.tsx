import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy · SHOTCLOCK" };

export default function Page() {
  return (
    <article className="max-w-3xl space-y-4 text-sm leading-relaxed">
      <h1 className="text-3xl font-black">Privacy (v0.01 template)</h1>
      <p className="text-hot font-bold">Template: have this reviewed before collecting real personal data.</p>
      <p>SHOTCLOCK v0.01 has no accounts backend. Your player profile, portfolio uploads, listings, offers, giveaway entries and newsletter opt-in are stored only in this browser (localStorage). Nothing is sent to our servers.</p>
      <p>Clearing your browser storage deletes all of it. We don&apos;t use tracking cookies or sell data.</p>
      <p>When accounts, email and payments launch, this page will list what we collect, why, how long we keep it, who processes it and how to request access or deletion.</p>
    </article>
  );
}
