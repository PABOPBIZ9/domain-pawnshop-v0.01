import type { Metadata } from "next";
import { GiveawayPage } from "@/components/GiveawayPage";

export const metadata: Metadata = {
  title: "SHOTCLOCK Launch Giveaway · enter free",
  description: "Worldwide 18+. Enter free, no purchase necessary. Prizes are placeholders until announced.",
};

export default function Page() {
  return <GiveawayPage />;
}
