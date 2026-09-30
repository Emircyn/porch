import "server-only"

import { createClient } from "@supabase/supabase-js"
import { cache } from "react"

import type { PublicLink, PublicProfile, SocialLink } from "@/lib/demo-profile"
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env"
import type { Database } from "@/lib/supabase/types"
import { getTheme } from "@/lib/themes"

/** Anonymous client with no cookies, so public pages can be cached and served to everyone alike. */
export function createAnonClient() {
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type RawPage = {
  username: string
  displayName: string
  bio: string
  avatarUrl: string | null
  socials: SocialLink[]
  themeId: string
  links: PublicLink[]
}

/** One database round trip per page (public_page() does the plan rules), shared by metadata and the page. */
export const getPublicPage = cache(async (username: string) => {
  const { data, error } = await createAnonClient().rpc("public_page", { page_username: username })
  if (error) throw new Error("Could not load this page")
  if (!data) return null
  const raw = data as unknown as RawPage
  const profile: PublicProfile = {
    username: raw.username,
    displayName: raw.displayName,
    bio: raw.bio,
    avatarUrl: raw.avatarUrl,
    socials: raw.socials ?? [],
    themeId: getTheme(raw.themeId).id,
  }
  return { profile, links: raw.links }
})
