import type { Metadata } from "next"
import { CheckIcon, CreditCardIcon, InfoIcon } from "lucide-react"

import { SubmitButton } from "@/app/(site)/(auth)/submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FREE_LINK_LIMIT, PRO_PRICE_USD } from "@/lib/plans"
import { getCurrentProfile } from "@/lib/profile"
import { themes } from "@/lib/themes"

import { openBillingPortal, startCheckout } from "./actions"
import { RefreshUntilPro } from "./refresh-until-pro"

export const metadata: Metadata = { title: "Billing" }

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long" })

export default async function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  const { profile } = await getCurrentProfile()
  const { checkout, demo } = await searchParams
  const isPro = profile.plan === "pro"
  const until = profile.current_period_end ? dateFormat.format(new Date(profile.current_period_end)) : null
  const waiting = checkout === "success" && !isPro

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Your plan, your card and your invoices.</p>
      </div>

      {waiting ? (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          Payment received. Switching your page to Pro, this takes a few seconds.
          <RefreshUntilPro />
        </p>
      ) : null}
      {checkout === "success" && isPro ? (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
          You&apos;re on Pro. Every theme, unlimited links and click analytics are unlocked.
        </p>
      ) : null}
      {profile.is_demo || demo ? (
        <p role="status" className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          This is the demo account, so billing is switched off. Sign up to try the real checkout with a test card.
        </p>
      ) : null}
      {checkout === "cancelled" ? (
        <p role="status" className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Checkout was cancelled. Nothing was charged.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardDescription>Current plan</CardDescription>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {isPro ? "Pro" : "Free"}
            {isPro ? <Badge>${PRO_PRICE_USD} / month</Badge> : <Badge variant="secondary">$0</Badge>}
          </CardTitle>
          {isPro && until ? (
            <p className="text-sm text-muted-foreground">
              {profile.cancel_at_period_end
                ? `Cancelled. Pro stays on until ${until}, then your page moves to the free plan.`
                : profile.subscription_status === "past_due"
                  ? `Your last payment didn't go through. Stripe will retry; update your card to keep Pro.`
                  : `Renews on ${until}.`}
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2.5 text-sm sm:grid-cols-2">
            {(isPro
              ? ["Unlimited links", `All ${themes.length} themes`, "Clicks per day and per link", "Sources and countries"]
              : [`Up to ${FREE_LINK_LIMIT} links`, `${themes.filter((t) => !t.pro).length} themes`, "Your own short address", "Photo, bio and socials"]
            ).map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 border-t pt-6">
          {isPro ? (
            <form action={openBillingPortal}>
              <SubmitButton pendingLabel="Opening Stripe">
                <CreditCardIcon /> Manage billing
              </SubmitButton>
            </form>
          ) : (
            <form action={startCheckout} className="w-full sm:w-auto">
              <SubmitButton pendingLabel="Opening checkout">Upgrade to Pro for ${PRO_PRICE_USD}/month</SubmitButton>
            </form>
          )}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Porch runs Stripe in test mode, so no real money moves. Pay with card 4242 4242 4242 4242, any future
            date and any CVC.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
