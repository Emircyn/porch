"use client"

import { useSearchParams } from "next/navigation"

import { FieldSeparator } from "@/components/ui/field"

import { GitHubButton } from "../github-button"
import { SignupForm } from "./signup-form"

export function SignupContent({ username, plan }: { username?: string; plan?: string }) {
  // "Get Pro" on the pricing table: after sign-up, go straight to checkout.
  const next = plan === "pro" ? "/dashboard/billing" : undefined
  const initialUsername = username ? username.toLowerCase().slice(0, 30) : undefined
  const oauthNext =
    next ?? (initialUsername ? `/onboarding?username=${encodeURIComponent(initialUsername)}` : "/onboarding")
  return (
    <>
      <GitHubButton next={oauthNext} />
      <FieldSeparator>or</FieldSeparator>
      {/* key: a name arriving from the query string after the static shell has rendered still fills the field. */}
      <SignupForm key={initialUsername ?? ""} initialUsername={initialUsername} next={next} />
    </>
  )
}

/** Reads ?username= and ?plan= in the browser, so the sign-up page itself can be static. */
export function SignupWithParams() {
  const params = useSearchParams()
  return <SignupContent username={params.get("username") ?? undefined} plan={params.get("plan") ?? undefined} />
}
