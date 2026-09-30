"use client"

import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ProfileView } from "@/components/profile/profile-view"
import type { PublicLink, PublicProfile } from "@/lib/demo-profile"
import type { PageTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

type Mode = "auto" | "light" | "dark"
const modes: { value: Mode; label: string; icon: typeof SunIcon }[] = [
  { value: "auto", label: "Follow my device", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
]

/**
 * A theme shown full size on a real page, with a floating bar to step through the themes and flip between
 * light and dark. The bar is neutral (black glass) so it reads on every theme.
 */
export function ThemePreview({
  theme,
  profile,
  links,
  previous,
  next,
}: {
  theme: PageTheme
  profile: PublicProfile
  links: PublicLink[]
  previous: PageTheme
  next: PageTheme
}) {
  const [mode, setMode] = useState<Mode>("auto")

  return (
    <>
      {/* "dark" on a wrapper switches the theme to its dark tokens; "auto" leaves it to the visitor's device. */}
      <div className={cn(mode === "dark" && "dark")}>
        <ProfileView
          profile={profile}
          links={links}
          theme={theme}
          interactive={false}
          nameAs="h1"
          colorMode={mode === "auto" ? "auto" : undefined}
          className="min-h-svh pb-28"
        />
      </div>

      <nav
        aria-label="Theme preview"
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] items-center gap-0.5 rounded-full sm:gap-1 bg-zinc-950/85 p-1.5 font-sans text-sm text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
      >
        <Link
          href="/#themes"
          aria-label="All themes"
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 sm:size-9 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <Link
          href={`/themes/${previous.id}`}
          aria-label={`Previous theme: ${previous.name}`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 sm:size-9 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
        <span className="flex min-w-0 items-center gap-2 px-1">
          <span className="truncate text-[13px] font-medium sm:text-sm">{theme.name}</span>
          <span
            className={cn(
              // Phones: the bar is tight, so the name gets the room and the badge waits for wider screens.
              "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline",
              theme.pro ? "bg-violet-500 text-white" : "bg-white/15 text-white"
            )}
          >
            {theme.pro ? "Pro" : "Free"}
          </span>
        </span>
        <Link
          href={`/themes/${next.id}`}
          aria-label={`Next theme: ${next.name}`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 sm:size-9 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          <ChevronRightIcon className="size-4" />
        </Link>

        <div role="radiogroup" aria-label="Light or dark" className="ml-1 hidden items-center rounded-full bg-white/10 p-0.5 sm:flex">
          {modes.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={mode === option.value}
              aria-label={option.label}
              title={option.label}
              onClick={() => setMode(option.value)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none",
                mode === option.value ? "bg-white text-zinc-950" : "text-white/80 hover:text-white"
              )}
            >
              <option.icon className="size-4" />
            </button>
          ))}
        </div>
        {/* Phones: one button that cycles, to keep the bar narrow. */}
        <button
          type="button"
          onClick={() => setMode(modes[(modes.findIndex((m) => m.value === mode) + 1) % modes.length].value)}
          aria-label={`Colour mode: ${modes.find((m) => m.value === mode)!.label}. Tap to change.`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/15 sm:size-9 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none sm:hidden"
        >
          {(() => {
            const Icon = modes.find((m) => m.value === mode)!.icon
            return <Icon className="size-4" />
          })()}
        </button>

        <Link
          href={theme.pro ? "/signup?plan=pro" : "/signup"}
          className="ml-1 shrink-0 rounded-full bg-white px-3 py-2 text-sm font-semibold sm:px-3.5 text-zinc-950 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          <span className="sm:hidden">Use it</span>
          <span className="hidden sm:inline">Use this theme</span>
        </Link>
      </nav>
    </>
  )
}
