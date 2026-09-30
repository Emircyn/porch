import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { personaForTheme } from "@/lib/demo-profile"
import { themes } from "@/lib/themes"

import { ThemePreview } from "./theme-preview"

// Every theme is known at build time, so all preview pages are static.
export const dynamicParams = false

export function generateStaticParams() {
  return themes.map((theme) => ({ id: theme.id }))
}

export async function generateMetadata({ params }: PageProps<"/themes/[id]">): Promise<Metadata> {
  const { id } = await params
  const theme = themes.find((t) => t.id === id)
  if (!theme) return { title: "Theme not found" }
  const title = `${theme.name} theme for your link-in-bio page · Porch`
  const description = `See the ${theme.name} theme on a real Porch page, in light and dark.`
  // Pre-rendered by scripts/build-og-images.mjs, so link previews cost the Worker nothing.
  const images = [{ url: `/og/themes/${theme.id}.jpg`, width: 1200, height: 630, alt: `The ${theme.name} theme` }]
  return {
    title,
    description,
    openGraph: { title, description, images, type: "website", siteName: "Porch" },
    twitter: { card: "summary_large_image", title, description, images },
  }
}

export default async function ThemePage({ params }: PageProps<"/themes/[id]">) {
  const { id } = await params
  const index = themes.findIndex((t) => t.id === id)
  if (index < 0) notFound()
  const theme = themes[index]
  const { profile, links } = personaForTheme(theme.id)

  return (
    <main>
      <ThemePreview
        theme={theme}
        profile={profile}
        links={links}
        previous={themes[(index - 1 + themes.length) % themes.length]}
        next={themes[(index + 1) % themes.length]}
      />
    </main>
  )
}
