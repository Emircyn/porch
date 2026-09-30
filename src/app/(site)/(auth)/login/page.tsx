import type { Metadata } from "next"
import Link from "next/link"

import { FieldSeparator } from "@/components/ui/field"

import { GitHubButton } from "../github-button"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Log in" }

const linkErrors: Record<string, string> = {
  link: "That link has expired or was already used. Log in, or sign up again.",
  oauth: "GitHub sign-in isn't available right now. Use your e-mail instead.",
  demo: "The demo account is taking a break. Try again in a minute, or sign up for your own page.",
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams
  const nextPath = typeof next === "string" ? next : undefined
  const errorMessage = typeof error === "string" ? linkErrors[error] : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to edit your page and see your clicks.</p>
      </div>
      {errorMessage ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <GitHubButton next={nextPath} />
      <FieldSeparator>or</FieldSeparator>
      <LoginForm next={nextPath} />
      <p className="text-center text-sm text-muted-foreground">
        New to Porch?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create your page
        </Link>
      </p>
    </div>
  )
}
