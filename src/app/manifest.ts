import type { MetadataRoute } from "next";
import { BRAND_COLORS } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SHOTCLOCK: domains on the clock",
    short_name: "SHOTCLOCK",
    description: "Live, countdown-driven quick-sale marketplace for domain names. Bid before the clock runs out.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_COLORS.base,
    theme_color: BRAND_COLORS.base,
    categories: ["shopping", "business", "games"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
