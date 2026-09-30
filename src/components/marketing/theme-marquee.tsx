import { EyeIcon } from "lucide-react"
import Link from "next/link"

import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import { Badge } from "@/components/ui/badge"
import { Marquee } from "@/components/ui/marquee"
import { personaForTheme } from "@/lib/demo-profile"
import { themes } from "@/lib/themes"

export function ThemeMarquee() {
  return (
    <div className="relative">
      <Marquee pauseOnHover repeat={2} className="[--duration:50s] [--gap:1.5rem]">
        {themes.map((theme) => {
          const { profile, links } = personaForTheme(theme.id)
          return (
            <Link
              key={theme.id}
              href={`/themes/${theme.id}`}
              target="_blank"
              rel="noopener"
              aria-label={`Preview the ${theme.name} theme (opens in a new tab)`}
              className="group/theme w-44 shrink-0 rounded-[2.2rem] focus-visible:outline-none"
            >
              <figure>
                <div className="relative">
                  <PhoneFrame width={176}>
                    <ProfileView profile={profile} links={links} theme={theme} interactive={false} className="h-full" />
                  </PhoneFrame>
                  {/* Hover or keyboard focus: dim the phone and offer a full-size preview. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center rounded-[1.75rem] bg-zinc-950/0 opacity-0 transition-all duration-200 group-hover/theme:bg-zinc-950/35 group-hover/theme:opacity-100 group-focus-visible/theme:bg-zinc-950/35 group-focus-visible/theme:opacity-100 motion-reduce:transition-none"
                  >
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-lg">
                      <EyeIcon className="size-4" /> Preview
                    </span>
                  </span>
                </div>
                <figcaption className="mt-3 flex items-center justify-between px-1 text-sm">
                  <span className="font-medium group-hover/theme:underline group-hover/theme:underline-offset-4">
                    {theme.name}
                  </span>
                  {theme.pro ? <Badge>Pro</Badge> : <Badge variant="secondary">Free</Badge>}
                </figcaption>
              </figure>
            </Link>
          )
        })}
      </Marquee>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background sm:w-32" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background sm:w-32" />
    </div>
  )
}
