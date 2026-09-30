import { siteHost } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The "porch.example.com/" in front of a page-name field. Long hosts (workers.dev) are cut from the start,
 * "…workers.dev/", so the part next to the name stays readable and the field keeps room to type.
 */
export function HostPrefix({ className }: { className?: string }) {
  return (
    <span
      dir="rtl"
      title={`${siteHost}/`}
      className={cn("min-w-0 shrink truncate text-left text-muted-foreground select-none", className)}
    >
      <span dir="ltr">{siteHost}/</span>
    </span>
  )
}
