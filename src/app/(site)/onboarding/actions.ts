"use server"

import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { usernameSchema } from "@/lib/usernames"

export type OnboardingState = { error?: string; username?: string } | null

export async function chooseUsername(_: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const raw = String(formData.get("username") ?? "")
  const parsed = usernameSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message, username: raw }

  const { profile } = await getCurrentProfile()
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update({ username: parsed.data }).eq("id", profile.id)
  if (error) {
    return {
      error: error.code === "23505" ? "That name is taken. Try another." : "Couldn't save your name. Try again.",
      username: raw,
    }
  }
  redirect("/dashboard")
}
