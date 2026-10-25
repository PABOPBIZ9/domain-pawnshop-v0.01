import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/config/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Canonical/metadataBase intentionally NOT set yet: shotclock.buzz (planned primary) is pending registration.
export const metadata: Metadata = {
  title: "SHOTCLOCK: domains on the clock",
  description:
    "Live, countdown-driven quick-sale marketplace for domain names. Real names, expiring fast, priced to move. Bid before the clock runs out.",
  applicationName: site.name,
  other: { "shotclock:domain": site.domains.current, "shotclock:planned-domain": site.domains.plannedPrimary },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body id="top" className="min-h-full flex flex-col bg-grid">
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
