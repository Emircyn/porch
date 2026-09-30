"use client"

import { MousePointerClickIcon, TrophyIcon, UsersIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { EditorLink } from "@/lib/demo-profile"

export type ClickStats = {
  daily: { day: string; clicks: number }[]
  perLink: { linkId: string; clicks: number }[]
  referrers: { name: string; share: number }[]
  countries: { code: string; name: string; share: number }[]
}

const chartConfig = {
  clicks: { label: "Clicks", color: "var(--chart-1)" },
} satisfies ChartConfig

const number = new Intl.NumberFormat("en-US")
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 })
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

function flag(code: string) {
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}

export default function AnalyticsPanel({ stats, links }: { stats: ClickStats; links: EditorLink[] }) {
  const total = stats.daily.reduce((sum, day) => sum + day.clicks, 0)
  const titles = new Map(links.map((link) => [link.id, link.title]))
  const perLink = stats.perLink
    .filter((row) => titles.has(row.linkId))
    .map((row) => ({ ...row, title: titles.get(row.linkId)! }))
  const topLink = perLink[0]
  const topSource = stats.referrers[0]
  const maxLink = Math.max(1, ...perLink.map((row) => row.clicks))
  const lastWeek = stats.daily.slice(-7).reduce((sum, day) => sum + day.clicks, 0)
  const weekBefore = stats.daily.slice(-14, -7).reduce((sum, day) => sum + day.clicks, 0)
  const change = weekBefore ? (lastWeek - weekBefore) / weekBefore : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={MousePointerClickIcon} label="Clicks, 30 days" value={number.format(total)}>
          <span className={change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
            {change >= 0 ? "+" : ""}
            {percent.format(change)}
          </span>{" "}
          vs. the week before
        </StatCard>
        <StatCard icon={TrophyIcon} label="Top link" value={topLink ? number.format(topLink.clicks) : "0"}>
          <span className="line-clamp-1">{topLink?.title ?? "No clicks yet"}</span>
        </StatCard>
        <StatCard icon={UsersIcon} label="Top source" value={topSource ? topSource.name : "None"}>
          {topSource ? `${percent.format(topSource.share)} of clicks` : "No clicks yet"}
        </StatCard>
      </div>

      <Card className="gap-2 py-5">
        <CardHeader className="px-5">
          <CardTitle>Clicks per day</CardTitle>
          <CardDescription>Last 30 days, in UTC</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-4">
          <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
            <AreaChart data={stats.daily} margin={{ left: 8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fill-clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tickFormatter={(value: string) => shortDate.format(new Date(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(value) => shortDate.format(new Date(String(value)))}
                  />
                }
              />
              <Area
                dataKey="clicks"
                type="monotone"
                fill="url(#fill-clicks)"
                stroke="var(--color-clicks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Clicks per link</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <ul className="flex flex-col gap-3">
              {perLink.map((row) => (
                <li key={row.linkId} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="truncate">{row.title}</span>
                    <span className="text-muted-foreground tabular-nums">{number.format(row.clicks)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(row.clicks / maxLink) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="gap-4 py-5">
          <CardHeader className="px-5">
            <CardTitle>Where visitors come from</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-5 px-5 text-sm">
            <ShareList title="Sources" rows={stats.referrers.map((r) => ({ key: r.name, label: r.name, share: r.share }))} />
            <ShareList
              title="Countries"
              rows={stats.countries.map((c) => ({ key: c.code, label: `${flag(c.code)} ${c.name}`, share: c.share }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="flex flex-row items-center justify-between px-4">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="px-4">
        <p className="truncate text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{children}</p>
      </CardContent>
    </Card>
  )
}

function ShareList({ title, rows }: { title: string; rows: { key: string; label: string; share: number }[] }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.key} className="flex justify-between gap-2">
            <span className="truncate">{row.label}</span>
            <span className="text-muted-foreground tabular-nums">{percent.format(row.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
