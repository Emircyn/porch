import { Button } from "@/components/ui/button"
import { siteHost } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Works without JavaScript: a GET form that carries the chosen name to sign-up. */
export function ClaimForm({ id, className }: { id: string; className?: string }) {
  return (
    <form
      action="/signup"
      method="get"
      className={cn(
        "flex w-full max-w-md items-center gap-1 rounded-xl border bg-card p-1.5 shadow-lg shadow-primary/5 transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        className
      )}
    >
      <label htmlFor={id} className="sr-only">
        Choose your page name
      </label>
      <span className="shrink-0 pl-2.5 text-muted-foreground select-none">{siteHost}/</span>
      <input
        id={id}
        name="username"
        placeholder="yourname"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        pattern="[a-zA-Z0-9_.]{3,30}"
        title="3 to 30 letters, numbers, dots or underscores"
        className="h-10 min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-muted-foreground/60"
      />
      <Button type="submit" className="h-10 shrink-0 rounded-lg px-4">
        Claim it
      </Button>
    </form>
  )
}
