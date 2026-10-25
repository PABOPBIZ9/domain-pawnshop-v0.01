import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BRAND_COLORS, SITE_URL, site } from "@/config/site";
import { theme } from "@/config/theme";
import { themeVars } from "@/kit/theme";
import type { CSSProperties } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const TITLE = "SHOTCLOCK: domains on the clock";
const DESCRIPTION =
  "Live, countdown-driven quick-sale marketplace for domain names. Real names, expiring fast, priced to move. Bid before the clock runs out.";

// metadataBase/canonical come from ONE value: SITE_URL in src/config/site.ts (vercel.app today, shotclock.store once DNS is live).
// Icons: app/favicon.ico, app/icon.svg, app/apple-icon.png, app/manifest.ts, app/opengraph-image.png (file conventions).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  applicationName: site.name,
  keywords: ["domains for sale", "domain marketplace", "expiring domains", "buy domains fast", "domain auction", "SHOTCLOCK"],
  openGraph: { type: "website", siteName: site.name, url: "/", title: TITLE, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, site: "@shotclockfun", creator: "@shotclockfun" },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  other: {
    "shotclock:domain": site.domains.current,
    "msapplication-TileColor": BRAND_COLORS.base,
    "msapplication-TileImage": "/mstile-150x150.png",
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLORS.base,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" style={themeVars(theme) as CSSProperties} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={BRAND_COLORS.signature} />
      </head>
      <body id="top" className="min-h-full flex flex-col">
        <div className="lx-stars" aria-hidden />
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
