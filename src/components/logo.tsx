import { cn } from "@/lib/utils"

/** An arched front door with the porch light on, in the brand colour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 27V16.5a6 6 0 0 1 12 0V27Z"
        className="fill-primary-foreground"
      />
      <circle cx="17.6" cy="21.5" r="1.1" className="fill-primary" />
      <circle
        cx="25"
        cy="11"
        r="4.6"
        className="fill-primary-foreground"
        opacity="0.25"
      />
      <circle cx="25" cy="11" r="2.3" className="fill-primary-foreground" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">Porch</span>
    </span>
  )
}
