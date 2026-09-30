import Link from "next/link"

import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import { personaForTheme } from "@/lib/demo-profile"
import { getTheme } from "@/lib/themes"

// Two-column auth layout after shadcn's signup-02 block: the form, and the product on the other side.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Porch home" className="rounded-lg">
            <Logo />
          </Link>
          <ModeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      <div
        aria-hidden="true"
        className="relative isolate hidden flex-col items-center justify-center gap-10 overflow-hidden border-l bg-muted/40 lg:flex"
      >
        <div className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute top-1/3 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-glow blur-3xl" />
        <PhoneFrame width={280} className="-rotate-2">
          <ProfileView
            profile={personaForTheme("bubblegum").profile}
            links={personaForTheme("bubblegum").links}
            theme={getTheme("bubblegum")}
            interactive={false}
          />
        </PhoneFrame>
        <p className="max-w-xs text-center text-sm text-muted-foreground">
          Your photo, your links and a theme you like, at one short address.
        </p>
      </div>
    </div>
  )
}
