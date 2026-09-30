import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import { personaForTheme } from "@/lib/demo-profile"
import { getTheme } from "@/lib/themes"

// The three boldest themes, worn by the three people in the hero.
const left = personaForTheme("bubblegum") // Emre Yaraşır
const center = personaForTheme("cyberpunk") // Emircan Erdemci
const right = personaForTheme("sunset-horizon") // Muhammet Ahmet Beştepe

/** Three creators, three themes: a still collage, no motion. Purely decorative. */
export function HeroPhone() {
  return (
    <div aria-hidden="true" className="relative mx-auto flex h-[37rem] w-full max-w-[34rem] items-center justify-center">
      <div className="absolute inset-10 -z-10 rounded-full bg-brand-glow blur-3xl" />

      {[left, right].map((persona, index) => (
        <PhoneFrame
          key={persona.profile.username}
          width={220}
          className={
            index === 0
              ? "absolute top-14 left-0 -rotate-6 max-sm:-left-12"
              : "absolute top-14 right-0 rotate-6 max-sm:-right-12"
          }
        >
          <ProfileView
            profile={persona.profile}
            links={persona.links}
            theme={getTheme(persona.profile.themeId)}
            interactive={false}
          />
        </PhoneFrame>
      ))}
      <PhoneFrame width={270} className="relative z-10">
        <ProfileView
          profile={center.profile}
          links={center.links}
          theme={getTheme(center.profile.themeId)}
          interactive={false}
        />
      </PhoneFrame>
    </div>
  )
}
