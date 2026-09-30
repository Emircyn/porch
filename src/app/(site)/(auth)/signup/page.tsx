import type { Metadata } from "next"
import Link from "next/link"

import { FieldSeparator } from "@/components/ui/field"
import { FREE_LINK_LIMIT } from "@/lib/plans"

import { GitHubButton } from "../github-button"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = { title: "Create your page" }

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { username } = await searchParams
  const initialUsername = typeof username === "string" ? username.toLowerCase().slice(0, 30) : undefined
  const oauthNext = initialUsername ? `/onboarding?username=${encodeURIComponent(initialUsername)}` : "/onboarding"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Create your page</h1>
        <p className="text-sm text-muted-foreground">
          Free for up to {FREE_LINK_LIMIT} links. No card needed.
        </p>
      </div>
      <GitHubButton next={oauthNext} />
      <FieldSeparator>or</FieldSeparator>
      <SignupForm initialUsername={initialUsername} />
      <p className="text-center text-sm text-muted-foreground">
        Already have a page?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  )
}
