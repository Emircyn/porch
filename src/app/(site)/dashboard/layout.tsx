import Link from "next/link"
import { redirect } from "next/navigation"

import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { getCurrentProfile } from "@/lib/profile"

import { DashboardNav } from "./dashboard-nav"
import { UserMenu } from "./user-menu"

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { profile, email } = await getCurrentProfile()
  if (!profile.username) redirect("/onboarding")

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link href="/dashboard" aria-label="Dashboard" className="rounded-lg">
            <Logo />
          </Link>
          {profile.plan === "pro" ? <Badge>Pro</Badge> : null}
          <DashboardNav />
          <div className="ml-auto flex items-center gap-1.5">
            <ModeToggle />
            <UserMenu
              email={email}
              username={profile.username}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  )
}
