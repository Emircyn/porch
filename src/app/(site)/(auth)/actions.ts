"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import * as z from "zod/mini"

import { createClient } from "@/lib/supabase/server"
import { usernameSchema } from "@/lib/usernames"

export type AuthState = {
  error?: string
  fieldErrors?: Partial<Record<"email" | "password" | "username", string>>
  checkEmail?: string
  values?: { email?: string; username?: string }
} | null

/** Only same-site paths, so `?next=` cannot send people to another domain. */
function safeNext(value: FormDataEntryValue | null, fallback = "/dashboard") {
  const next = typeof value === "string" ? value : ""
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback
}

async function siteOrigin() {
  const fromHeader = (await headers()).get("origin")
  return fromHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

const emailSchema = z.pipe(z.string().check(z.trim(), z.toLowerCase()), z.email("Enter a valid e-mail address."))

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = emailSchema.safeParse(formData.get("email"))
  const password = String(formData.get("password") ?? "")
  if (!email.success) {
    return { fieldErrors: { email: email.error.issues[0].message }, values: { email: String(formData.get("email") ?? "") } }
  }
  if (!password) {
    return { fieldErrors: { password: "Enter your password." }, values: { email: email.data } }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password })
  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Confirm your e-mail first. The link is in your inbox."
        : error.code === "invalid_credentials"
          ? "That e-mail and password don't match."
          : "Couldn't log you in. Try again in a moment."
    return { error: message, values: { email: email.data } }
  }

  redirect(safeNext(formData.get("next")))
}

const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: z.string().check(z.minLength(8, "Use at least 8 characters."), z.maxLength(72, "Use 72 characters or fewer.")),
})

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
  }
  const parsed = signUpSchema.safeParse({ ...values, password: formData.get("password") })
  if (!parsed.success) {
    const fieldErrors: NonNullable<AuthState>["fieldErrors"] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "username" | "email" | "password"
      fieldErrors[field] ??= issue.message
    }
    return { fieldErrors, values }
  }

  const supabase = await createClient()
  const { data: available } = await supabase.rpc("username_available", { name: parsed.data.username })
  if (!available) {
    return { fieldErrors: { username: "That name is taken. Try another." }, values }
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/dashboard`,
    },
  })
  if (error) {
    if (error.code === "user_already_exists") {
      return { fieldErrors: { email: "An account with this e-mail already exists. Log in instead." }, values }
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: "Pick a stronger password." }, values }
    }
    return { error: "Couldn't create your account. Try again in a moment.", values }
  }

  // With e-mail confirmation on, there is no session until the link is opened.
  if (!data.session) return { checkEmail: parsed.data.email }
  redirect(safeNext(formData.get("next")))
}

export async function signInWithGitHub(formData: FormData) {
  const next = safeNext(formData.get("next"))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  })
  if (error || !data.url) {
    redirect(`/login?error=oauth`)
  }
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
