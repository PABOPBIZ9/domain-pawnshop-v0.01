import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

const ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, freq: "hourly" },
  { path: "/shotclock", priority: 0.9, freq: "hourly" },
  { path: "/market", priority: 0.9, freq: "hourly" },
  { path: "/giveaway", priority: 0.8, freq: "daily" },
  { path: "/bundles", priority: 0.7, freq: "daily" },
  { path: "/upload", priority: 0.6, freq: "weekly" },
  { path: "/dou", priority: 0.5, freq: "weekly" },
  { path: "/terms", priority: 0.2, freq: "monthly" },
  { path: "/privacy", priority: 0.2, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({ url: `${SITE_URL}${r.path}`, lastModified, changeFrequency: r.freq, priority: r.priority }));
}
