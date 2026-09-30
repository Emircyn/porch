"use client"

import { useSearchParams } from "next/navigation"

import { FieldSeparator } from "@/components/ui/field"

import { GitHubButton } from "../github-button"
import { LoginForm } from "./login-form"

const linkErrors: Record<string, string> = {
  link: "That link has expired or was already used. Log in, or sign up again.",
  oauth: "GitHub sign-in isn't available right now. Use your e-mail instead.",
  demo: "The demo account is taking a break. Try again in a minute, or sign up for your own page.",
}

export function LoginContent({ next, error }: { next?: string; error?: string }) {
  const errorMessage = error ? linkErrors[error] : undefined
  return (
    <>
      {errorMessage ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <GitHubButton next={next} />
      <FieldSeparator>or</FieldSeparator>
      <LoginForm next={next} />
    </>
  )
}

/** Reads ?next= and ?error= in the browser, so the login page itself can be static. */
export function LoginWithParams() {
  const params = useSearchParams()
  return <LoginContent next={params.get("next") ?? undefined} error={params.get("error") ?? undefined} />
}
