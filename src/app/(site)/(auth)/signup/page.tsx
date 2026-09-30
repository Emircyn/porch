import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { FREE_LINK_LIMIT } from "@/lib/plans"

import { SignupContent, SignupWithParams } from "./signup-content"

export const metadata: Metadata = { title: "Create your page" }

// Static: the query string is read in the browser, so no server render per visit (Workers free plan CPU).
export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Create your page</h1>
        <p className="text-sm text-muted-foreground">Free for up to {FREE_LINK_LIMIT} links. No card needed.</p>
      </div>
      <Suspense fallback={<SignupContent />}>
        <SignupWithParams />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        Already have a page?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  )
}
