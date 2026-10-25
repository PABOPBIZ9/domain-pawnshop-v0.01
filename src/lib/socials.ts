import { ICONS } from "./social-icons";

export type Platform = keyof typeof ICONS;

/** Public profile URL for a handle. Returns null when handle is empty (never invent accounts). */
export function profileUrl(platform: Platform, raw: string): string | null {
  const h = raw.trim().replace(/^@/, "");
  if (!h) return null;
  const e = encodeURIComponent(h);
  switch (platform) {
    case "x": return `https://x.com/${e}`;
    case "tiktok": return `https://www.tiktok.com/@${e}`;
    case "instagram": return `https://www.instagram.com/${e}`;
    case "youtube": return `https://www.youtube.com/@${e}`;
    case "discord": return `https://discord.gg/${e}`;
    case "twitch": return `https://www.twitch.tv/${e}`;
    case "kick": return `https://kick.com/${e}`;
    case "telegram": return `https://t.me/${e}`;
    case "threads": return `https://www.threads.net/@${e}`;
    case "snapchat": return `https://www.snapchat.com/add/${e}`;
    case "facebook": return `https://www.facebook.com/${e}`;
    case "linkedin": return `https://www.linkedin.com/company/${e}`;
    case "pinterest": return `https://www.pinterest.com/${e}`;
    case "reddit": return `https://www.reddit.com/r/${e}`;
    case "spotify": return `https://open.spotify.com/user/${e}`;
    case "substack": return `https://${e}.substack.com`;
    case "medium": return `https://medium.com/@${e}`;
    case "rumble": return `https://rumble.com/c/${e}`;
    case "whatsapp": return `https://whatsapp.com/channel/${e}`;
    case "bluesky": return `https://bsky.app/profile/${e}`;
    case "roblox": return `https://www.roblox.com/groups/${e}`;
  }
}

export const platformTitle = (p: Platform) => ICONS[p].title;
export const ALL_PLATFORMS = Object.keys(ICONS) as Platform[];
