"use client";

import { useState } from "react";
import Link from "next/link";

const PRODUCTS = [
  ["🃏", "Dou Dizhu", "A degen poker-style card game. The first core-team product."],
  ["📡", "Dou Agency", "A social listening and content remix studio that turns chatter into audio, photo, video and comics."],
  ["⏱", "SHOTCLOCK", "Quizzes, competitions, prizes and quick sales, all on the clock."],
  ["🎁", "Drops & giveaways", "Email and Telegram campaigns, collectibles and rewards for early fans."],
  ["🧑‍🎨", "Creator directory", "Onboarding streamers, vibe coders, artists and devs."],
  ["💸", "Fan-first rewards", "Shifting value back to fans and users instead of big tech."],
];

const KEY = "shotclock:dou-waitlist";

export function DouTeaser({ full = false }: { full?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function join() {
    try {
      const list = JSON.parse(window.localStorage.getItem(KEY) || "[]") as string[];
      if (!list.includes(email)) list.push(email);
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
    setDone(true);
  }

  return (
    <section className="card p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-violet/30 blur-3xl" />
      <div className="relative space-y-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full border border-violet/40 bg-violet/15 text-violet-300">
          COMING SOON · DOU DIGITAL ecosystem
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
          DOU <span className="text-violet-300">DIGITAL</span>
        </h2>
        <p className="text-mute max-w-2xl">
          A creator-first ecosystem that starts with core-team products and later onboards creators, streamers, vibe coders, artists and devs. The
          mission is to shift value back to the fans and users. SHOTCLOCK is one of the first products.
        </p>
        {full && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRODUCTS.map(([icon, t, d]) => (
              <div key={t} className="rounded-xl bg-panel2 border border-line p-4">
                <div className="text-2xl">{icon}</div>
                <div className="font-bold mt-1">{t}</div>
                <p className="text-xs text-mute mt-1">{d}</p>
              </div>
            ))}
          </div>
        )}
        {done ? (
          <div className="rounded-xl border border-acid/40 bg-acid/10 text-acid p-3 text-sm">✓ You&apos;re on the list (saved on this device).</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input
              className="input flex-1 min-w-0 basis-60"
              type="email"
              aria-label="Email for the DOU DIGITAL waitlist"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-violet" disabled={!valid} onClick={join}>
              Join the waitlist
            </button>
            {!full && (
              <Link href="/dou" className="btn btn-ghost">
                Learn more
              </Link>
            )}
          </div>
        )}
        <p className="text-[11px] text-mute">v0.01 preview: the waitlist is stored only in this browser and isn&apos;t sent anywhere yet.</p>
      </div>
    </section>
  );
}
