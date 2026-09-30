import type Stripe from "stripe"

import type { Plan } from "@/lib/supabase/types"

/**
 * Pro while Stripe still expects the subscription to be paid: active, in a trial, or past due while Stripe
 * retries the card. Everything else (canceled, unpaid, incomplete, paused) is Free.
 */
export function planFromStatus(status: Stripe.Subscription.Status | null | undefined): Plan {
  return status === "active" || status === "trialing" || status === "past_due" ? "pro" : "free"
}

/** Newer Stripe API versions keep the period on each item rather than on the subscription. */
export function periodEnd(subscription: Stripe.Subscription): string | null {
  const seconds =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    subscription.items?.data[0]?.current_period_end
  return seconds ? new Date(seconds * 1000).toISOString() : null
}

export type BillingUpdate = {
  plan: Plan
  stripe_customer_id: string
  stripe_subscription_id: string | null
  subscription_status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export function billingFromSubscription(subscription: Stripe.Subscription): BillingUpdate {
  const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
  return {
    plan: planFromStatus(subscription.status),
    stripe_customer_id: customer,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: periodEnd(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end || subscription.cancel_at !== null,
  }
}
