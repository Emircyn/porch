import type { PageTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"

/** A tiny page drawn with the theme's own shadcn variables: background, a card and a primary button. */
export function ThemeSwatch({ theme, className }: { theme: PageTheme; className?: string }) {
  return (
    <div
      data-page-theme={theme.id}
      aria-hidden="true"
      className={cn("flex flex-col items-center gap-1.5 bg-background p-2.5 font-sans", className)}
    >
      <span className="size-5 rounded-full bg-primary/80 ring-2 ring-background" />
      <span className="h-1.5 w-10 rounded-full bg-foreground/70" />
      <span className="mt-1 h-3.5 w-full rounded-[calc(var(--radius)*0.6)] bg-primary shadow-[var(--page-shadow-xs)]" />
      <span className="h-3.5 w-full rounded-[calc(var(--radius)*0.6)] border bg-card shadow-[var(--page-shadow-xs)]" />
      <span className="h-3.5 w-full rounded-[calc(var(--radius)*0.6)] border bg-card shadow-[var(--page-shadow-xs)]" />
    </div>
  )
}
