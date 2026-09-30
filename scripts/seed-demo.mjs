// Creates or resets the public demo account (Maya Okafor, @mayamakes): profile, links and 90 days of clicks.
// Safe to run again; it wipes the demo's links and clicks first. Usage: npm run seed:demo
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required")
const admin = createClient(url, secret, { auth: { persistSession: false } })

const EMAIL = process.env.DEMO_EMAIL ?? "demo@example.com"
const USERNAME = "mayamakes"
const DAYS = 90
const LAUNCH = 21 // days ago the autumn collection went live

// A small seeded random generator, so every reset produces the same, believable numbers.
let seed = 20260930
const random = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (weights) => {
  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  let roll = random() * total
  for (const [value, w] of weights) if ((roll -= w) <= 0) return value
  return weights.at(-1)[0]
}

async function findOrCreateUser() {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((user) => user.email === EMAIL)
    if (found) return found.id
    if (data.users.length < 200) break
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    email_confirm: true,
    password: crypto.randomUUID(), // never used: /demo signs in with a one-time link
    user_metadata: { username: USERNAME, full_name: "Maya Okafor" },
  })
  if (error) throw error
  return data.user.id
}

const userId = await findOrCreateUser()

const { error: profileError } = await admin
  .from("profiles")
  .update({
    username: USERNAME,
    display_name: "Maya Okafor",
    bio: "Wheel-thrown stoneware from a tiny studio in Lisbon. New batch every season, classes every weekend.",
    avatar_url: "/demo/maya.svg",
    theme_id: "clean-slate",
    plan: "pro",
    is_demo: true,
    socials: [
      { platform: "instagram", url: "https://instagram.com/mayamakes" },
      { platform: "tiktok", url: "https://tiktok.com/@mayamakes" },
      { platform: "youtube", url: "https://youtube.com/@mayamakes" },
      { platform: "pinterest", url: "https://pinterest.com/mayamakes" },
    ],
  })
  .eq("id", userId)
if (profileError) throw profileError

await admin.from("links").delete().eq("user_id", userId) // clicks go with them (on delete cascade)

const linkRows = [
  { title: "The autumn collection is live", url: "https://mayamakes.shop/autumn", layout: "featured", enabled: true, weight: 34 },
  { title: "Book a wheel-throwing class", url: "https://cal.com/mayamakes/class", layout: "classic", enabled: true, weight: 24 },
  { title: "Studio vlog: glazing, start to finish", url: "https://youtube.com/@mayamakes", layout: "classic", enabled: true, weight: 16 },
  { title: "Seconds and one-offs on Etsy", url: "https://etsy.com/shop/mayamakes", layout: "classic", enabled: true, weight: 13 },
  { title: "Letters from the studio", url: "https://mayamakes.substack.com", layout: "classic", enabled: true, weight: 9 },
  { title: "What I throw pots to", url: "https://open.spotify.com/playlist/mayamakes", layout: "classic", enabled: false, weight: 4 },
]
const { data: links, error: linksError } = await admin
  .from("links")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- weight only drives the fake clicks
  .insert(linkRows.map(({ weight, ...row }, position) => ({ ...row, position, user_id: userId })))
  .select("id")
if (linksError) throw linksError

const referrers = [["instagram.com", 55], ["tiktok.com", 20], [null, 13], ["youtube.com", 7], ["t.co", 3], ["pinterest.com", 2]]
const countries = [["PT", 32], ["GB", 16], ["US", 15], ["DE", 9], ["BR", 8], ["ES", 6], ["FR", 5], ["NL", 4], ["TR", 3], ["JP", 2]]
// Evenings and lunch breaks, when people scroll.
const hours = Array.from({ length: 24 }, (_, h) => [h, h < 7 ? 1 : h >= 19 && h <= 22 ? 9 : h >= 12 && h <= 14 ? 6 : 3])

const clicks = []
const today = new Date()
today.setUTCHours(0, 0, 0, 0)
for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
  const day = new Date(today.getTime() - daysAgo * 86_400_000)
  const growth = 18 + (DAYS - daysAgo) * 0.75 // a page slowly finding its audience
  const weekend = [0, 6].includes(day.getUTCDay()) ? 1.45 : 1
  const launch = daysAgo <= LAUNCH ? 1 + 1.3 * Math.exp(-(LAUNCH - daysAgo) / 3.5) : 1 // the autumn collection
  const count = Math.round(growth * weekend * launch * (0.85 + random() * 0.3))
  for (let i = 0; i < count; i++) {
    const hour = pick(hours)
    const at = new Date(day.getTime() + hour * 3_600_000 + Math.floor(random() * 3_600_000))
    if (at > new Date()) continue
    const linkWeights = linkRows.map((row, index) => [
      index,
      index === 0 ? (daysAgo > LAUNCH ? row.weight * 0.3 : row.weight * 1.6) : index === 5 && daysAgo < 30 ? 0 : row.weight,
    ])
    clicks.push({
      link_id: links[pick(linkWeights)].id,
      user_id: userId,
      created_at: at.toISOString(),
      referrer_host: pick(referrers),
      country: pick(countries),
    })
  }
}

for (let i = 0; i < clicks.length; i += 1000) {
  const { error } = await admin.from("clicks").insert(clicks.slice(i, i + 1000))
  if (error) throw error
}

console.log(`Demo ready: @${USERNAME} (${EMAIL}), ${links.length} links, ${clicks.length} clicks over ${DAYS} days`)
