import "server-only"

import type { ClickStats } from "@/components/editor/analytics-panel"
import { platformForUrl } from "@/lib/platforms"
import type { createClient } from "@/lib/supabase/server"

type RawStats = {
  daily: { day: string; clicks: number }[]
  perLink: { linkId: string; clicks: number }[]
  referrers: { host: string | null; clicks: number }[]
  countries: { code: string; clicks: number }[]
  total: number
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" })

function sourceName(host: string | null) {
  if (!host) return "Direct"
  return platformForUrl(`https://${host}`)?.name ?? host.replace(/^www\./, "")
}

/** Pro stats for the signed-in user, shaped for the analytics panel. Null when not Pro or on error. */
export async function loadStats(supabase: Awaited<ReturnType<typeof createClient>>): Promise<ClickStats | null> {
  const { data, error } = await supabase.rpc("get_click_stats", { days: 30 })
  if (error || !data) return null
  const raw = data as unknown as RawStats
  const total = Math.max(1, raw.total)
  return {
    daily: raw.daily,
    perLink: raw.perLink,
    referrers: raw.referrers.map((row) => ({ name: sourceName(row.host), share: row.clicks / total })),
    countries: raw.countries.map((row) => ({
      code: row.code,
      name: countryNames.of(row.code) ?? row.code,
      share: row.clicks / total,
    })),
  }
}
