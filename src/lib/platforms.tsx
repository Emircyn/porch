export type Platform = {
  id: string
  name: string
  hosts: string[]
}

// Icons live in public/brand-icons.svg (scripts/build-brand-icons.mjs). Order is the order offered in the
// social links picker.
export const platforms: Platform[] = [
  { id: "instagram", name: "Instagram", hosts: ["instagram.com"] },
  { id: "tiktok", name: "TikTok", hosts: ["tiktok.com"] },
  { id: "youtube", name: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  { id: "x", name: "X", hosts: ["x.com", "twitter.com"] },
  { id: "threads", name: "Threads", hosts: ["threads.net", "threads.com"] },
  { id: "bluesky", name: "Bluesky", hosts: ["bsky.app"] },
  { id: "pinterest", name: "Pinterest", hosts: ["pinterest.com", "pin.it"] },
  { id: "spotify", name: "Spotify", hosts: ["spotify.com"] },
  { id: "soundcloud", name: "SoundCloud", hosts: ["soundcloud.com"] },
  { id: "twitch", name: "Twitch", hosts: ["twitch.tv"] },
  { id: "github", name: "GitHub", hosts: ["github.com"] },
  { id: "etsy", name: "Etsy", hosts: ["etsy.com"] },
  { id: "substack", name: "Substack", hosts: ["substack.com"] },
  { id: "patreon", name: "Patreon", hosts: ["patreon.com"] },
]

export function platformForUrl(url: string): Platform | null {
  let host: string
  try {
    host = new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
  return (
    platforms.find((platform) =>
      platform.hosts.some((known) => host === known || host.endsWith(`.${known}`))
    ) ?? null
  )
}

export function BrandIcon({ platform, className }: { platform: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor">
      <use href={`/brand-icons.svg#${platform}`} />
    </svg>
  )
}
