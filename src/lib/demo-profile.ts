import type { ThemeId } from "@/lib/themes"

export type SocialLink = { platform: string; url: string }

export type PublicProfile = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string | null
  themeId: ThemeId
  socials: SocialLink[]
}

export type LinkLayout = "classic" | "featured"

export type PublicLink = {
  id: string
  title: string
  url: string
  layout: LinkLayout
}

export type EditorLink = PublicLink & { enabled: boolean }

/** The demo account: a ceramic artist with a small studio. Also drives the landing page. */
export const demoProfile: PublicProfile = {
  username: "mayamakes",
  displayName: "Maya Okafor",
  bio: "Wheel-thrown stoneware from a tiny studio in Lisbon. New batch every season, classes every weekend.",
  avatarUrl: "/demo/maya.svg",
  themeId: "clean-slate",
  socials: [
    { platform: "instagram", url: "https://instagram.com/mayamakes" },
    { platform: "tiktok", url: "https://tiktok.com/@mayamakes" },
    { platform: "youtube", url: "https://youtube.com/@mayamakes" },
    { platform: "pinterest", url: "https://pinterest.com/mayamakes" },
  ],
}

export const demoLinks: EditorLink[] = [
  { id: "autumn", title: "The autumn collection is live", url: "https://mayamakes.shop/autumn", layout: "featured", enabled: true },
  { id: "classes", title: "Book a wheel-throwing class", url: "https://cal.com/mayamakes/class", layout: "classic", enabled: true },
  { id: "vlog", title: "Studio vlog: glazing, start to finish", url: "https://youtube.com/watch?v=glazing101", layout: "classic", enabled: true },
  { id: "etsy", title: "Seconds and one-offs on Etsy", url: "https://etsy.com/shop/mayamakes", layout: "classic", enabled: true },
  { id: "newsletter", title: "Letters from the studio", url: "https://mayamakes.substack.com", layout: "classic", enabled: true },
  { id: "playlist", title: "What I throw pots to", url: "https://open.spotify.com/playlist/mayamakes", layout: "classic", enabled: false },
]

const clicksPerDay = [
  41, 38, 52, 47, 63, 88, 79, 45, 49, 44, 58, 61, 94, 86, 52, 55, 60, 57, 71, 118, 103, 64, 59, 66, 72, 69, 131,
  124, 77, 70,
]

/** 30 days of made-up but plausible stats: weekend spikes, a jump when the autumn collection launched. */
export const demoStats = {
  daily: clicksPerDay.map((clicks, index) => {
    const day = new Date(Date.UTC(2026, 8, 1 + index))
    return { day: day.toISOString().slice(0, 10), clicks }
  }),
  perLink: [
    { linkId: "autumn", clicks: 791 },
    { linkId: "classes", clicks: 507 },
    { linkId: "vlog", clicks: 341 },
    { linkId: "etsy", clicks: 268 },
    { linkId: "newsletter", clicks: 154 },
    { linkId: "playlist", clicks: 32 },
  ],
  referrers: [
    { name: "Instagram", share: 0.58 },
    { name: "TikTok", share: 0.21 },
    { name: "Direct", share: 0.12 },
    { name: "YouTube", share: 0.06 },
    { name: "Other", share: 0.03 },
  ],
  countries: [
    { code: "PT", name: "Portugal", share: 0.34 },
    { code: "GB", name: "United Kingdom", share: 0.17 },
    { code: "US", name: "United States", share: 0.15 },
    { code: "DE", name: "Germany", share: 0.09 },
    { code: "BR", name: "Brazil", share: 0.08 },
  ],
}

type Persona = { profile: PublicProfile; links: PublicLink[] }

const persona = (
  profile: Omit<PublicProfile, "avatarUrl"> & { avatar: string },
  links: [title: string, url: string][]
): Persona => ({
  profile: { ...profile, avatarUrl: `/demo/${profile.avatar}.svg` },
  links: links.map(([title, url], index) => ({
    id: `${profile.username}-${index}`,
    title,
    url,
    layout: index === 0 ? "featured" : "classic",
  })),
})

/**
 * Creators for the landing page: one per theme, each drawn in a different DiceBear style (credited in the
 * footer). Six are real people added at the site owner's request; the rest are made up.
 */
export const showcasePersonas: Persona[] = [
  persona(
    {
      username: "emircyn",
      displayName: "Emircan Erdemci",
      bio: "Frontend developer in Ankara. React, Vue, Astro and TypeScript, built with AI-assisted workflows.",
      avatar: "emircan",
      themeId: "cyberpunk",
      socials: [{ platform: "github", url: "https://github.com/Emircyn" }],
    },
    [
      ["Hire me on Upwork", "https://www.upwork.com/freelancers/~0171a99e329c46e08d"],
      ["Portfolio: emircyn.com", "https://emircyn.com"],
      ["Parley: AI chat with live tool cards", "https://parley.emircan-erdemci.workers.dev"],
      ["Porch: this link-in-bio builder", "https://github.com/Emircyn/porch"],
      ["Agentic starter kit for Claude Code", "https://github.com/Emircyn/agentic-setup-starter-kit"],
    ]
  ),
  persona(
    {
      username: "emreyarasir",
      displayName: "Emre Yaraşır",
      bio: "Product designer. Interfaces, icons and a weekly letter about design.",
      avatar: "emre",
      themeId: "bubblegum",
      socials: [
        { platform: "instagram", url: "https://instagram.com/emreyarasir" },
        { platform: "x", url: "https://x.com/emreyarasir" },
      ],
    },
    [
      ["My design portfolio", "https://emreyarasir.design"],
      ["Free Figma icon set", "https://emreyarasir.design/icons"],
      ["The weekly design letter", "https://emreyarasir.substack.com"],
      ["Book a portfolio review", "https://cal.com/emreyarasir/review"],
    ]
  ),
  persona(
    {
      username: "semihdonmez",
      displayName: "Semih Dönmez",
      bio: "Mobile developer. Swift, Kotlin and far too many side projects.",
      avatar: "semih",
      themeId: "neo-brutalism",
      socials: [
        { platform: "github", url: "https://github.com/semihdonmez" },
        { platform: "bluesky", url: "https://bsky.app/profile/semihdonmez" },
      ],
    },
    [
      ["My new app is on the App Store", "https://apps.apple.com/app/semih"],
      ["Open source on GitHub", "https://github.com/semihdonmez"],
      ["Talks and tutorials", "https://youtube.com/@semihdonmez"],
      ["Say hello", "mailto:hello@semihdonmez.dev"],
    ]
  ),
  persona(
    {
      username: "muhammetbestepe",
      displayName: "Muhammet Ahmet Beştepe",
      bio: "Photographer. The streets of Istanbul, one frame a day.",
      avatar: "muhammet",
      themeId: "sunset-horizon",
      socials: [
        { platform: "instagram", url: "https://instagram.com/muhammetbestepe" },
        { platform: "pinterest", url: "https://pinterest.com/muhammetbestepe" },
      ],
    },
    [
      ["New series: Bosphorus mornings", "https://muhammetbestepe.com/bosphorus"],
      ["Prints and zines", "https://muhammetbestepe.com/shop"],
      ["Book a photo walk in Istanbul", "https://cal.com/muhammetbestepe/walk"],
      ["The daily archive", "https://instagram.com/muhammetbestepe"],
    ]
  ),
  persona(
    {
      username: "ridvanmalikokur",
      displayName: "Rıdvan Malik Okur",
      bio: "Backend developer. Go, Postgres and APIs that just work.",
      avatar: "ridvan",
      themeId: "starry-night",
      socials: [
        { platform: "github", url: "https://github.com/ridvanmalikokur" },
        { platform: "x", url: "https://x.com/ridvanmalikokur" },
      ],
    },
    [
      ["Read my engineering notes", "https://ridvanmalikokur.dev/notes"],
      ["Open source on GitHub", "https://github.com/ridvanmalikokur"],
      ["Talks and slides", "https://ridvanmalikokur.dev/talks"],
      ["Get in touch", "mailto:hello@ridvanmalikokur.dev"],
    ]
  ),
  persona(
    {
      username: "onurkucuk",
      displayName: "Onur Küçük",
      bio: "Full-stack developer. Web apps, side projects and a lot of coffee.",
      avatar: "onur",
      themeId: "ocean-breeze",
      socials: [
        { platform: "github", url: "https://github.com/onurkucuk" },
        { platform: "x", url: "https://x.com/onurkucuk" },
      ],
    },
    [
      ["See what I'm building", "https://onurkucuk.dev"],
      ["Open source on GitHub", "https://github.com/onurkucuk"],
      ["Notes from the terminal", "https://onurkucuk.substack.com"],
      ["Say hello", "mailto:hello@onurkucuk.dev"],
    ]
  ),
  persona(
    {
      username: "theomakesgames",
      displayName: "Theo Laurent",
      bio: "Solo dev making Lanternfall, a cosy puzzle game about lighthouses. Devlogs every Friday.",
      avatar: "theo",
      themeId: "vercel",
      socials: [
        { platform: "x", url: "https://x.com/theomakesgames" },
        { platform: "twitch", url: "https://twitch.tv/theomakesgames" },
        { platform: "youtube", url: "https://youtube.com/@theomakesgames" },
      ],
    },
    [
      ["Play the free demo", "https://theomakesgames.itch.io/lanternfall"],
      ["Wishlist Lanternfall", "https://store.steampowered.com/app/lanternfall"],
      ["Devlog #14: lighting the sea", "https://youtube.com/@theomakesgames"],
      ["Join the playtest", "https://discord.gg/lanternfall"],
    ]
  ),
  persona(
    {
      username: "aikobakes",
      displayName: "Aiko Tan",
      bio: "Home baker and food photographer in Osaka. Sourdough, milk bread and far too many croissants.",
      avatar: "aiko",
      themeId: "vintage-paper",
      socials: [
        { platform: "instagram", url: "https://instagram.com/aikobakes" },
        { platform: "tiktok", url: "https://tiktok.com/@aikobakes" },
      ],
    },
    [
      ["Free sourdough starter guide", "https://aikobakes.com/starter"],
      ["Book a milk bread class", "https://cal.com/aikobakes/class"],
      ["Weekly recipes by e-mail", "https://aikobakes.substack.com"],
      ["Food prints on Etsy", "https://etsy.com/shop/aikobakes"],
    ]
  ),
  persona(
    {
      username: "lenaflows",
      displayName: "Lena Fischer",
      bio: "Yoga teacher in Berlin. Slow flows, early mornings, no handstands required.",
      avatar: "lena",
      themeId: "kodama-grove",
      socials: [
        { platform: "instagram", url: "https://instagram.com/lenaflows" },
        { platform: "youtube", url: "https://youtube.com/@lenaflows" },
        { platform: "spotify", url: "https://open.spotify.com/user/lenaflows" },
      ],
    },
    [
      ["Book a class in Kreuzberg", "https://cal.com/lenaflows/class"],
      ["Free 20-minute morning flow", "https://youtube.com/@lenaflows"],
      ["Spring retreat in Portugal", "https://lenaflows.de/retreat"],
      ["My practice playlist", "https://open.spotify.com/playlist/lenaflows"],
    ]
  ),
  persona(
    {
      username: "diegoramos",
      displayName: "Diego Ramos",
      bio: "DJ and producer from Valencia. House, disco and long sunsets.",
      avatar: "diego",
      themeId: "caffeine",
      socials: [
        { platform: "soundcloud", url: "https://soundcloud.com/diegoramos" },
        { platform: "instagram", url: "https://instagram.com/diegoramos" },
        { platform: "twitch", url: "https://twitch.tv/diegoramos" },
      ],
    },
    [
      ["New mix: Balearic sunset", "https://soundcloud.com/diegoramos/balearic-sunset"],
      ["Upcoming gigs", "https://diegoramos.es/gigs"],
      ["Stream the new EP", "https://open.spotify.com/album/diegoramos"],
      ["Bookings", "mailto:bookings@diegoramos.es"],
    ]
  ),
  persona(
    {
      username: "zeynepdraws",
      displayName: "Zeynep Kaya",
      bio: "Illustrator in Izmir. Soft colours, sleepy cats and far too many stickers.",
      avatar: "zeynep",
      themeId: "claymorphism",
      socials: [
        { platform: "instagram", url: "https://instagram.com/zeynepdraws" },
        { platform: "tiktok", url: "https://tiktok.com/@zeynepdraws" },
        { platform: "pinterest", url: "https://pinterest.com/zeynepdraws" },
      ],
    },
    [
      ["The sticker shop is open", "https://zeynepdraws.shop"],
      ["Commission a pet portrait", "https://zeynepdraws.shop/commissions"],
      ["Process videos", "https://tiktok.com/@zeynepdraws"],
      ["Support me on Patreon", "https://patreon.com/zeynepdraws"],
    ]
  ),
]

/** The creator shown for a theme: Maya for her own theme, otherwise whoever uses it. */
export function personaForTheme(themeId: string): Persona {
  return (
    showcasePersonas.find((p) => p.profile.themeId === themeId) ?? {
      profile: demoProfile,
      links: demoLinks.filter((link) => link.enabled),
    }
  )
}
