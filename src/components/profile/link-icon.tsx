import { CalendarDaysIcon, Link2Icon, MailIcon, ShoppingBagIcon } from "lucide-react"

import { BrandIcon, platformForUrl } from "@/lib/platforms"

/** A brand icon when the address is a known platform, otherwise a plain icon guessed from the address. */
export function LinkIcon({ url, className }: { url: string; className?: string }) {
  const platform = platformForUrl(url)
  if (platform) return <BrandIcon platform={platform.id} className={className} />

  const lower = url.toLowerCase()
  if (lower.startsWith("mailto:")) return <MailIcon aria-hidden="true" className={className} />
  if (/shop|store|buy/.test(lower)) return <ShoppingBagIcon aria-hidden="true" className={className} />
  if (/cal\.com|calendly|book|class/.test(lower)) return <CalendarDaysIcon aria-hidden="true" className={className} />
  return <Link2Icon aria-hidden="true" className={className} />
}
