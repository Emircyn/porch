import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { LoginContent, LoginWithParams } from "./login-content"

export const metadata: Metadata = { title: "Log in" }

// Static: the query string is read in the browser, so no server render per visit (Workers free plan CPU).
export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to edit your page and see your clicks.</p>
      </div>
      <Suspense fallback={<LoginContent />}>
        <LoginWithParams />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        New to Porch?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create your page
        </Link>
      </p>
    </div>
  )
}
