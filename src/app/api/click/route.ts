import { z } from "zod"

import { createAnonClient } from "@/lib/public-page"

const body = z.object({
  id: z.uuid(),
  ref: z.string().max(255).optional(),
})

const bots = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor/i

// Receives the click beacon from public pages. Stores the link, the referring site's host and the country
// Cloudflare already knows; no IP, no cookie.
export async function POST(request: Request) {
  if (bots.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 })

  let parsed
  try {
    parsed = body.safeParse(JSON.parse(await request.text()))
  } catch {
    return new Response(null, { status: 400 })
  }
  if (!parsed.success) return new Response(null, { status: 400 })

  const country = request.headers.get("cf-ipcountry")
  await createAnonClient().rpc("record_click", {
    click_link_id: parsed.data.id,
    click_referrer_host: parsed.data.ref || undefined,
    click_country: country && /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : undefined,
  })
  return new Response(null, { status: 204 })
}
