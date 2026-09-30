import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

/** The signed-in user's profile, once per request. Redirects to /login when signed out. */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) redirect("/login")

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error || !profile) throw new Error("Could not load your profile")
  const metadata = claims.claims.user_metadata as Record<string, unknown> | undefined
  const githubUsername = typeof metadata?.user_name === "string" ? metadata.user_name : undefined
  return { profile, email: (claims.claims.email as string | undefined) ?? null, githubUsername }
})
