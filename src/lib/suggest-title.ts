import { platformForUrl } from "@/lib/platforms"
import { youtubeVideoId } from "@/lib/youtube"

const byPlatform: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "My YouTube channel",
  x: "X",
  threads: "Threads",
  bluesky: "Bluesky",
  pinterest: "Pinterest",
  spotify: "Listen on Spotify",
  soundcloud: "Listen on SoundCloud",
  twitch: "Watch me on Twitch",
  github: "GitHub",
  etsy: "Shop on Etsy",
  substack: "Read my newsletter",
  patreon: "Support me on Patreon",
}

/** A sensible starting title for a new link, so nobody has to type "YouTube" by hand. */
export function suggestTitle(rawUrl: string): string | null {
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  let host: string
  try {
    host = new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
  if (!host.includes(".")) return null
  if (youtubeVideoId(url)) return "Watch on YouTube"
  const platform = platformForUrl(url)
  if (platform) return byPlatform[platform.id] ?? platform.name
  if (/cal\.com|calendly\.com/.test(host)) return "Book a call"
  if (/shop|store/.test(url.toLowerCase())) return "Visit my shop"
  return host
}
