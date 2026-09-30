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
  return {
    title: `${theme.name} theme · Porch`,
    description: `See the ${theme.name} theme on a real Porch page, in light and dark.`,
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
