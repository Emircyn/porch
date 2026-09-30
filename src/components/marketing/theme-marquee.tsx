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
        {themes.map((theme) => (
          <figure key={theme.id} className="w-44 shrink-0">
            <PhoneFrame
              width={176}
              label={`${theme.name} theme preview`}
            >
              <ProfileView
                profile={personaForTheme(theme.id).profile}
                links={personaForTheme(theme.id).links}
                theme={theme}
                interactive={false}
                className="h-full"
              />
            </PhoneFrame>
            <figcaption className="mt-3 flex items-center justify-between px-1 text-sm">
              <span className="font-medium">{theme.name}</span>
              {theme.pro ? <Badge>Pro</Badge> : <Badge variant="secondary">Free</Badge>}
            </figcaption>
          </figure>
        ))}
      </Marquee>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background sm:w-32" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background sm:w-32" />
    </div>
  )
}
