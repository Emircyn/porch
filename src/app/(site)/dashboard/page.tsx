import type { Metadata } from "next"
import { ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

import { Editor } from "@/components/editor/editor"
import { Button } from "@/components/ui/button"
import type { EditorLink, SocialLink } from "@/lib/demo-profile"
import { getCurrentProfile } from "@/lib/profile"
import { loadStats } from "@/lib/stats"
import { createClient } from "@/lib/supabase/server"
import { getTheme } from "@/lib/themes"

import { addLink, deleteLink, reorderLinks, restoreLink, saveProfile, saveTheme, updateLink } from "./actions"

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
          <p className="text-sm text-muted-foreground">Changes save as you go and show up on your page within a minute.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${profile.username}`} target="_blank">
            <ExternalLinkIcon /> View page
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <Editor
          plan={profile.plan === "pro" ? "pro" : "free"}
          stats={stats}
          persistence={{ saveProfile, saveTheme, addLink, updateLink, deleteLink, restoreLink, reorderLinks }}
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
