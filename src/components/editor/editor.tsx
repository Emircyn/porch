"use client"

import {
  BarChart3Icon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  LayoutListIcon,
  LockIcon,
  PaletteIcon,
  PencilIcon,
  RotateCcwIcon,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useEffect, useReducer, useRef, useState } from "react"
import { toast } from "sonner"

import { PhoneFrame } from "@/components/phone-frame"
import { ProfileView } from "@/components/profile/profile-view"
import type * as DashboardActions from "@/app/(site)/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { siteHost } from "@/lib/site"
import { getTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

import { AppearancePanel } from "./appearance-panel"
import type { ClickStats } from "./analytics-panel"
import { editorReducer, type EditorAction, type EditorState } from "./editor-state"
import { LinksPanel } from "./links-panel"

// Recharts only loads when someone opens the Analytics tab.
const AnalyticsPanel = dynamic(() => import("./analytics-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-60 rounded-xl" />
    </div>
  ),
})

export type EditorPersistence = Pick<
  typeof DashboardActions,
  "saveProfile" | "saveTheme" | "addLink" | "updateLink" | "deleteLink" | "restoreLink" | "reorderLinks"
>

type EditorProps = {
  initialState: EditorState
  plan: "free" | "pro"
  stats: ClickStats | null
  /** Server actions that save each change. Without them (the landing page demo) nothing leaves the browser. */
  persistence?: EditorPersistence
  /** Demo mode offers a reset. */
  demo?: boolean
  className?: string
}

export function Editor({ initialState, plan, stats, persistence, demo = false, className }: EditorProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const stateRef = useRef(state)
  const [pending, setPending] = useState(0)
  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  /**
   * Applies a change on screen straight away, then saves it. If the server says no (plan limits, a lost
   * connection) the editor goes back to how it was and says why.
   */
  function change(action: EditorAction, save?: (p: EditorPersistence) => Promise<{ error?: string }>) {
    const before = stateRef.current
    dispatch(action)
    if (!persistence || !save) return
    setPending((count) => count + 1)
    save(persistence)
      .then((result) => {
        if (result.error) {
          toast.error(result.error)
          dispatch({ type: "reset", state: before })
        }
      })
      .catch(() => {
        toast.error("Couldn't reach the server. Your last change was not saved.")
        dispatch({ type: "reset", state: before })
      })
      .finally(() => setPending((count) => count - 1))
  }

  function changeProfile(patch: Partial<Pick<EditorState["profile"], "displayName" | "bio">>) {
    dispatch({ type: "profile", patch })
    if (!persistence) return
    // Typing saves once the person pauses, not on every key.
    if (profileTimer.current) clearTimeout(profileTimer.current)
    profileTimer.current = setTimeout(() => {
      const { displayName, bio } = stateRef.current.profile
      setPending((count) => count + 1)
      persistence
        .saveProfile({ displayName, bio })
        .then((result) => result.error && toast.error(result.error))
        .finally(() => setPending((count) => count - 1))
    }, 700)
  }

  function exportPage() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: stateRef.current.profile,
      links: stateRef.current.links.map(({ title, url, layout, enabled }) => ({ title, url, layout, enabled })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const href = URL.createObjectURL(blob)
    const anchor = Object.assign(document.createElement("a"), { href, download: `porch-${data.profile.username}.json` })
    anchor.click()
    URL.revokeObjectURL(href)
  }
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit")
  const theme = getTheme(state.profile.themeId)
  const visibleLinks = state.links.filter((link) => link.enabled)
  const pageUrl = `${siteHost}/${state.profile.username}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${pageUrl}`)
      toast.success("Link copied", { description: pageUrl })
    } catch {
      toast.error("Couldn't copy the link", { description: pageUrl })
    }
  }

  return (
    <div className={cn("grid lg:grid-cols-[minmax(0,1fr)_auto]", className)}>
      <div className={cn("flex min-w-0 flex-col gap-5 p-4 sm:p-6", mobileView === "preview" && "max-lg:hidden")}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{state.profile.displayName || state.profile.username}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground" aria-live="polite">
              {pageUrl}
              {persistence ? (
                pending > 0 ? (
                  <>
                    <Spinner className="size-3" /> Saving
                  </>
                ) : (
                  <>
                    <CheckIcon className="size-3" /> Saved
                  </>
                )
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {demo ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  dispatch({ type: "reset", state: initialState })
                  toast("Demo reset")
                }}
              >
                <RotateCcwIcon /> Reset
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={exportPage} aria-label="Export your page as JSON">
              <DownloadIcon /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <CopyIcon /> Copy link
            </Button>
          </div>
        </div>

        <Tabs defaultValue="links" className="gap-5">
          <TabsList className="w-full">
            <TabsTrigger value="links">
              <LayoutListIcon /> Links
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <PaletteIcon /> Appearance
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3Icon /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <LinksPanel
              links={state.links}
              plan={plan}
              onAdd={(input) => {
                const link = { id: crypto.randomUUID(), enabled: true, layout: "classic" as const, ...input }
                change({ type: "add-link", link }, (p) => p.addLink(link))
              }}
              onUpdate={(id, patch) => change({ type: "update-link", id, patch }, (p) => p.updateLink(id, patch))}
              onRemove={(id) => {
                const index = state.links.findIndex((link) => link.id === id)
                const removed = state.links[index]
                if (!removed) return
                change({ type: "remove-link", id }, (p) => p.deleteLink(id))
                toast("Link deleted", {
                  description: removed.title,
                  action: {
                    label: "Undo",
                    onClick: () => {
                      const ids = stateRef.current.links.map((link) => link.id)
                      ids.splice(Math.min(index, ids.length), 0, removed.id)
                      change({ type: "restore-link", link: removed, index }, async (p) => {
                        const restored = await p.restoreLink({ ...removed, position: index })
                        return restored.error ? restored : p.reorderLinks(ids)
                      })
                    },
                  },
                })
              }}
              onReorder={(ids) => change({ type: "reorder", ids }, (p) => p.reorderLinks(ids))}
            />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearancePanel
              profile={state.profile}
              plan={plan}
              onProfileChange={changeProfile}
              onThemeChange={(themeId) => change({ type: "theme", themeId }, (p) => p.saveTheme(themeId))}
            />
          </TabsContent>

          <TabsContent value="analytics">
            {plan === "pro" && stats ? (
              <AnalyticsPanel stats={stats} links={state.links} />
            ) : (
              <Empty className="border border-dashed py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <LockIcon />
                  </EmptyMedia>
                  <EmptyTitle>Analytics come with Pro</EmptyTitle>
                  <EmptyDescription>
                    See clicks per day and per link, and where your visitors come from.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/dashboard/billing">Upgrade to Pro</Link>
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div
        className={cn(
          "flex flex-col items-center gap-3 border-t bg-muted/40 px-4 py-6 sm:px-6 lg:border-t-0 lg:border-l",
          mobileView === "edit" && "max-lg:hidden"
        )}
      >
        <p className="hidden text-xs font-medium text-muted-foreground lg:block">Live preview</p>
        <PhoneFrame width={280} label={`Preview of your page in the ${theme.name} theme`}>
          <ProfileView profile={state.profile} links={visibleLinks} theme={theme} interactive={false} />
        </PhoneFrame>
      </div>

      <div className="sticky bottom-3 z-20 flex justify-center pb-3 lg:hidden">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setMobileView((view) => (view === "edit" ? "preview" : "edit"))}
        >
          {mobileView === "edit" ? (
            <>
              <EyeIcon /> Preview
            </>
          ) : (
            <>
              <PencilIcon /> Edit
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
