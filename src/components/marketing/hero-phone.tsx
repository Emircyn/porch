import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import { personaForTheme } from "@/lib/demo-profile"
import { getTheme } from "@/lib/themes"

// The three boldest themes, worn by the three people in the hero.
const left = personaForTheme("bubblegum") // Emre Yaraşır
const center = personaForTheme("cyberpunk") // Emircan Erdemci
const right = personaForTheme("sunset-horizon") // Muhammet Ahmet Beştepe

/**
 * Three creators, three themes: a still collage, no motion. It is composed once at 544 × 592 and scaled as a
 * whole (CSS zoom, which also scales its layout box), so the three phones keep their arrangement and stay
 * fully on screen from a small phone to a wide desktop.
 */
export function HeroPhone() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="relative h-[592px] w-[544px] shrink-0 [zoom:0.6] min-[420px]:[zoom:0.7] sm:[zoom:0.85] lg:[zoom:0.82] xl:[zoom:1]">
        <div className="absolute inset-10 -z-10 rounded-full bg-brand-glow blur-3xl" />
        {[left, right].map((persona, index) => (
          <PhoneFrame
            key={persona.profile.username}
            width={220}
            className={index === 0 ? "absolute top-14 left-0 -rotate-6" : "absolute top-14 right-0 rotate-6"}
          >
            <ProfileView
              profile={persona.profile}
              links={persona.links}
              theme={getTheme(persona.profile.themeId)}
              interactive={false}
            />
          </PhoneFrame>
        ))}
        <PhoneFrame width={270} className="absolute top-0 left-1/2 z-10 -translate-x-1/2">
          <ProfileView
            profile={center.profile}
            links={center.links}
            theme={getTheme(center.profile.themeId)}
            interactive={false}
          />
        </PhoneFrame>
      </div>
    </div>
  )
}
