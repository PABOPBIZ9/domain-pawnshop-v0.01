import type { Metadata } from "next";
import { Pricing } from "@/kit/auth/Pricing";

export const metadata: Metadata = { title: "OG membership | SHOTCLOCK", alternates: { canonical: "/pricing" } };

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black">👑 OG membership</h1>
        <p className="text-mute mt-1 max-w-2xl">Support SHOTCLOCK and unlock OG perks. Checkout is not open yet; buttons switch on when it is.</p>
      </div>
      <Pricing />
    </div>
  );
}
