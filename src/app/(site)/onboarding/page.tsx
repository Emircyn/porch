import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { Logo } from "@/components/logo"
import { getCurrentProfile } from "@/lib/profile"

import { OnboardingForm } from "./onboarding-form"

export const metadata: Metadata = { title: "Pick your page name" }

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { profile, githubUsername } = await getCurrentProfile()
  if (profile.username) redirect("/dashboard")
  const { username } = await searchParams
  // From the landing page's claim form, else the GitHub handle as a starting point.
  const suggestion = typeof username === "string" ? username : githubUsername

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-5 py-16">
      <Logo />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">One last thing</h1>
        <p className="text-muted-foreground">Pick the address people will use to find your page.</p>
      </div>
      <OnboardingForm initialUsername={suggestion?.toLowerCase()} />
    </main>
  )
}
