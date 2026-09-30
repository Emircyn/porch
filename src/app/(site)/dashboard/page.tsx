import type { Metadata } from "next"
import { ExternalLinkIcon, SparklesIcon } from "lucide-react"
import Link from "next/link"

import { LazyEditor as Editor } from "@/components/editor/editor-lazy"
import { Button } from "@/components/ui/button"
import type { EditorLink, SocialLink } from "@/lib/demo-profile"
import { getCurrentProfile } from "@/lib/profile"
import { loadStats } from "@/lib/stats"
import { createClient } from "@/lib/supabase/server"
import { getTheme } from "@/lib/themes"

import {
  addLink,
  deleteLink,
  reorderLinks,
  restoreLink,
  saveAvatar,
  saveProfile,
  uploadAvatarPhoto,
  saveSocials,
  saveTheme,
  updateLink,
} from "./actions"

export const metadata: Metadata = { title: "Your page" }

export default async function DashboardPage() {
  const { profile } = await getCurrentProfile()
  const supabase = await createClient()

  const [{ data: links }, stats] = await Promise.all([
    supabase
      .from("links")
      .select("id, title, url, layout, enabled")
      .eq("user_id", profile.id)
      .order("position")
      .order("created_at"),
    profile.plan === "pro" ? loadStats(supabase) : Promise.resolve(null),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your page</h1>
          <p className="text-sm text-muted-foreground">
            {profile.is_demo
              ? "The demo page, with 90 days of made-up visitors."
              : "Changes save as you go and show up on your page within a minute."}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${profile.username}`} target="_blank" prefetch={false}>
            <ExternalLinkIcon /> View page
          </Link>
        </Button>
      </div>

      {profile.is_demo ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <p className="flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" aria-hidden="true" />
            You&apos;re looking around the demo account. Try anything; changes aren&apos;t saved.
          </p>
          <Button asChild size="sm">
            <Link href="/signup">Create your own page</Link>
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <Editor
          plan={profile.plan === "pro" ? "pro" : "free"}
          stats={stats}
          demo={profile.is_demo}
          persistence={
            profile.is_demo
              ? undefined
              : {
                  saveProfile,
                  saveTheme,
                  saveSocials,
                  saveAvatar,
                  uploadAvatarPhoto,
                  addLink,
                  updateLink,
                  deleteLink,
                  restoreLink,
                  reorderLinks,
                }
          }
          initialState={{
            profile: {
              username: profile.username!,
              displayName: profile.display_name,
              bio: profile.bio,
              avatarUrl: profile.avatar_url,
              themeId: getTheme(profile.theme_id).id,
              socials: (profile.socials as SocialLink[] | null) ?? [],
            },
            links: (links ?? []) as EditorLink[],
          }}
        />
      </div>
    </div>
  )
}
