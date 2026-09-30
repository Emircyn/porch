import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LogoMark } from "@/components/logo"
import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import { personaForTheme } from "@/lib/demo-profile"
import { siteHost } from "@/lib/site"
import { themes } from "@/lib/themes"

export const metadata: Metadata = { robots: { index: false } }

/**
 * 1200 × 630 link-preview cards, drawn with the real components and screenshotted by
 * scripts/build-og-images.mjs into public/og. Only served by the dev server; production uses the images.
 *   /og-card/themes/<id>  a theme, on the page of the creator who uses it
 *   /og-card/pages/<id>   any page in that theme: no one's face or name, since that comes from og:title
 */
export default async function OgCard({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>
  searchParams: Promise<{ host?: string }>
}) {
  if (process.env.NODE_ENV !== "development") notFound()
  const { kind, id } = await params
  const theme = themes.find((t) => t.id === id)
  if (!theme || (kind !== "themes" && kind !== "pages")) notFound()
  const persona = personaForTheme(theme.id)
  const host = (await searchParams).host ?? siteHost

  return (
    <div
      data-page-theme={theme.id}
      id="og-card"
      className="relative isolate flex h-[630px] w-[1200px] overflow-hidden bg-background font-sans text-foreground [letter-spacing:var(--page-tracking)]"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/25 via-transparent to-primary/10" />
      <div className="absolute -right-24 -bottom-40 -z-10 size-[560px] rounded-full bg-primary/15 blur-3xl" />

      <div className="flex w-[640px] flex-col justify-between p-16">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <LogoMark className="size-10" />
          Porch
        </div>

        {kind === "themes" ? (
          <div className="flex flex-col gap-5">
            <p className="text-2xl text-muted-foreground">A Porch theme</p>
            <p className="text-8xl leading-[0.95] font-bold tracking-tight">{theme.name}</p>
            <div className="flex gap-3 text-xl font-semibold">
              <span className="rounded-full bg-primary px-4 py-1.5 text-primary-foreground">
                {theme.pro ? "Pro" : "Free"}
              </span>
              <span className="rounded-full border bg-card px-4 py-1.5 text-card-foreground">Light and dark</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-7xl leading-[1] font-bold tracking-tight">All my links, in one place</p>
            <p className="text-2xl text-muted-foreground">Tap through to see everything I make and share.</p>
          </div>
        )}

        <p className="text-xl whitespace-nowrap text-muted-foreground">
          {kind === "themes" ? host : "Made with Porch"}
        </p>
      </div>

      <div className="relative flex-1">
        <div className="absolute top-12 left-10 rotate-3">
          <PhoneFrame width={330}>
            {kind === "themes" ? (
              <ProfileView profile={persona.profile} links={persona.links} theme={theme} interactive={false} />
            ) : (
              <SkeletonPage />
            )}
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}

/** A page in the theme's colours with nobody on it: circle, name and bio bars, a row of links. */
function SkeletonPage() {
  return (
    <div className="flex min-h-full flex-col items-center bg-background px-6 pt-20 text-foreground">
      <div className="size-24 rounded-full bg-primary/25 ring-4 ring-background" />
      <div className="mt-5 h-5 w-40 rounded-full bg-foreground/80" />
      <div className="mt-3 h-3 w-24 rounded-full bg-muted-foreground/50" />
      <div className="mt-5 h-3 w-60 rounded-full bg-muted-foreground/35" />
      <div className="mt-2 h-3 w-52 rounded-full bg-muted-foreground/35" />
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="size-10 rounded-full border bg-card" />
        ))}
      </div>
      <div className="mt-8 flex w-full flex-col gap-3">
        <div className="h-24 rounded-lg bg-primary shadow-[var(--page-shadow-sm)]" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex h-14 items-center gap-3 rounded-lg border bg-card p-2 shadow-[var(--page-shadow-sm)]">
            <div className="size-10 rounded-md bg-muted" />
            <div className="h-3 flex-1 rounded-full bg-foreground/25" />
          </div>
        ))}
      </div>
    </div>
  )
}
