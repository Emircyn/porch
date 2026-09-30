import { Editor } from "@/components/editor/editor"
import { BorderBeam } from "@/components/ui/border-beam"
import { demoLinks, demoProfile, demoStats } from "@/lib/demo-profile"
import { siteHost } from "@/lib/site"

/** The real editor in demo mode, inside a browser window. Changes stay in the visitor's browser. */
export function EditorShowcase() {
  return (
    <div className="relative rounded-2xl border bg-card p-1.5 shadow-2xl shadow-primary/10 dark:shadow-black/40">
      <div className="flex items-center gap-2 px-3 py-2" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="mx-auto hidden rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground sm:block">
          {siteHost}/dashboard
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border bg-background">
        <Editor
          demo
          plan="pro"
          stats={demoStats}
          initialState={{ profile: demoProfile, links: demoLinks }}
        />
      </div>
      <BorderBeam size={140} duration={12} colorFrom="var(--color-primary)" colorTo="var(--color-chart-4)" />
    </div>
  )
}
