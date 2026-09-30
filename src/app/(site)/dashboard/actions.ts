"use server"

import { revalidatePath } from "next/cache"
import * as z from "zod/mini"

import { getCurrentProfile } from "@/lib/profile"
import { createClient } from "@/lib/supabase/server"
import { platforms } from "@/lib/platforms"
import { supabaseUrl } from "@/lib/supabase/env"
import { themes } from "@/lib/themes"

export type ActionResult = { error?: string }

const themeIds = themes.map((theme) => theme.id) as [string, ...string[]]
const linkFields = z.object({
  title: z.string().check(z.trim(), z.minLength(1), z.maxLength(80)),
  url: z.url({ protocol: /^https?$/ }).check(z.maxLength(2048)),
  layout: z.enum(["classic", "featured"]),
  enabled: z.boolean(),
})

/** Runs a change as the signed-in user, then refreshes their cached public page. */
async function run(change: (ctx: { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }) => PromiseLike<{ error: { code?: string; hint?: string; message: string } | null }>): Promise<ActionResult> {
  const { profile } = await getCurrentProfile()
  if (profile.is_demo) return { error: "The demo account is read-only. Sign up to make your own page." }
  const supabase = await createClient()
  const { error } = await change({ supabase, userId: profile.id })
  if (error) {
    if (error.hint === "link_limit") return { error: "The free plan has room for 5 links. Upgrade to Pro for more." }
    if (error.hint === "pro_theme") return { error: "That theme comes with Pro." }
    return { error: "Couldn't save that change. Try again." }
  }
  if (profile.username) revalidatePath(`/${profile.username}`)
  return {}
}

export async function saveProfile(input: { displayName: string; bio: string }): Promise<ActionResult> {
  const parsed = z
    .object({
      displayName: z.string().check(z.trim(), z.maxLength(60)),
      bio: z.string().check(z.trim(), z.maxLength(160)),
    })
    .safeParse(input)
  if (!parsed.success) return { error: "Name or bio is too long." }
  return run(({ supabase, userId }) =>
    supabase.from("profiles").update({ display_name: parsed.data.displayName, bio: parsed.data.bio }).eq("id", userId)
  )
}

export async function saveTheme(themeId: string): Promise<ActionResult> {
  const parsed = z.enum(themeIds).safeParse(themeId)
  if (!parsed.success) return { error: "Unknown theme." }
  return run(({ supabase, userId }) => supabase.from("profiles").update({ theme_id: parsed.data }).eq("id", userId))
}

export async function addLink(input: { id: string; title: string; url: string; layout: string }): Promise<ActionResult> {
  const parsed = z.extend(z.omit(linkFields, { enabled: true }), { id: z.uuid() }).safeParse(input)
  if (!parsed.success) return { error: "Check the title and address." }
  // New links go on top: one below the current minimum position.
  return run(async ({ supabase, userId }) => {
    const { data: first } = await supabase
      .from("links")
      .select("position")
      .eq("user_id", userId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle()
    return supabase.from("links").insert({ ...parsed.data, user_id: userId, position: (first?.position ?? 1) - 1 })
  })
}

export async function updateLink(id: string, patch: Record<string, unknown>): Promise<ActionResult> {
  const parsed = z.object({ id: z.uuid(), patch: z.partial(linkFields) }).safeParse({ id, patch })
  if (!parsed.success) return { error: "Check the title and address." }
  return run(({ supabase }) => supabase.from("links").update(parsed.data.patch).eq("id", parsed.data.id))
}

export async function deleteLink(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Unknown link." }
  return run(({ supabase }) => supabase.from("links").delete().eq("id", id))
}

export async function restoreLink(input: {
  id: string
  title: string
  url: string
  layout: string
  enabled: boolean
  position: number
}): Promise<ActionResult> {
  const parsed = z.extend(linkFields, { id: z.uuid(), position: z.int() }).safeParse(input)
  if (!parsed.success) return { error: "Couldn't restore that link." }
  return run(({ supabase, userId }) => supabase.from("links").insert({ ...parsed.data, user_id: userId }))
}

export async function reorderLinks(ids: string[]): Promise<ActionResult> {
  if (!z.array(z.uuid()).check(z.maxLength(500)).safeParse(ids).success) return { error: "Couldn't save the new order." }
  return run(({ supabase }) => supabase.rpc("reorder_links", { link_ids: ids }))
}

const platformIds = platforms.map((platform) => platform.id) as [string, ...string[]]

export async function saveSocials(socials: { platform: string; url: string }[]): Promise<ActionResult> {
  const parsed = z
    .array(z.object({ platform: z.enum(platformIds), url: z.url({ protocol: /^https?$/ }).check(z.maxLength(300)) }))
    .check(z.maxLength(8))
    .safeParse(socials)
  if (!parsed.success) return { error: "Check your social links: each needs a full address." }
  return run(({ supabase, userId }) => supabase.from("profiles").update({ socials: parsed.data }).eq("id", userId))
}

/** Only accepts a file in the user's own avatars folder, so nobody can point their photo at someone else's. */
export async function saveAvatar(url: string | null): Promise<ActionResult> {
  const { profile } = await getCurrentProfile()
  const prefix = `${supabaseUrl}/storage/v1/object/public/avatars/${profile.id}/`
  if (url !== null && (!url.startsWith(prefix) || url.length > 500)) return { error: "That photo can't be used." }
  return run(({ supabase, userId }) => supabase.from("profiles").update({ avatar_url: url }).eq("id", userId))
}

const MAX_AVATAR_BYTES = 512 * 1024

/**
 * Receives the photo the browser already cropped to a 400 × 400 WebP, stores it in the user's own folder
 * (Storage policies apply, since this runs as the user) and points the profile at it.
 */
export async function uploadAvatarPhoto(formData: FormData): Promise<ActionResult & { url?: string }> {
  const file = formData.get("photo")
  if (!(file instanceof Blob) || file.type !== "image/webp" || file.size === 0 || file.size > MAX_AVATAR_BYTES) {
    return { error: "That photo can't be used. Try a JPG or PNG." }
  }
  const { profile } = await getCurrentProfile()
  if (profile.is_demo) return { error: "The demo account is read-only. Sign up to make your own page." }

  const supabase = await createClient()
  const path = `${profile.id}/avatar.webp`
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: "image/webp", cacheControl: "31536000" })
  if (error) return { error: "The upload didn't go through. Try again." }

  // The path never changes, so a version stamp makes browsers and caches fetch the new photo.
  const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`
  const saved = await saveAvatar(url)
  return saved.error ? saved : { url }
}
