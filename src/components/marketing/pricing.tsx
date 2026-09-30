import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FREE_LINK_LIMIT, PRO_PRICE_USD } from "@/lib/plans"
import { themes } from "@/lib/themes"
import { cn } from "@/lib/utils"

const freeThemes = themes.filter((theme) => !theme.pro).length

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need for a clean page.",
    features: [`Up to ${FREE_LINK_LIMIT} links`, `${freeThemes} themes`, "Your own short address", "Photo and bio"],
    cta: { label: "Start for free", href: "/signup" },
    featured: false,
  },
  {
    name: "Pro",
    price: `$${PRO_PRICE_USD}`,
    period: "/ month",
    blurb: "For pages that do real work.",
    features: ["Unlimited links", `All ${themes.length} themes`, "Clicks per day and per link", "Cancel any time"],
    cta: { label: "Get Pro", href: "/signup?plan=pro" },
    featured: true,
  },
]

export function Pricing() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card p-7 sm:p-8",
            plan.featured && "border-primary/50 shadow-xl shadow-primary/10 ring-1 ring-primary/30"
          )}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.featured ? <Badge>Unlimited</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
            <span className="text-muted-foreground">{plan.period}</span>
          </p>
          <ul className="mt-7 flex flex-col gap-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckIcon aria-hidden="true" className="size-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" variant={plan.featured ? "default" : "outline"} className="mt-8 h-11">
            <Link href={plan.cta.href}>{plan.cta.label}</Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
