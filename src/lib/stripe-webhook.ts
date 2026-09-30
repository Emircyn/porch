import type Stripe from "stripe"

import { billingFromSubscription, type BillingUpdate } from "@/lib/billing"

export type WebhookDeps = {
  /** Always read the subscription fresh from Stripe, so events arriving late or twice cannot undo newer state. */
  getSubscription: (id: string) => Promise<Stripe.Subscription>
  /** Saves billing fields on the profile that owns the customer (or the user id from metadata) and returns its username. */
  saveBilling: (update: BillingUpdate, userId: string | null) => Promise<{ username: string | null } | null>
}

const subscriptionEvents = new Set<Stripe.Event.Type>([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
])

/**
 * Stripe webhooks are the only thing that changes a user's plan. Returns what happened, for logs and tests.
 */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps) {
  let subscriptionId: string | null = null
  let userId: string | null = null

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode !== "subscription" || !session.subscription) return { handled: false as const }
    subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id
    userId = session.client_reference_id
  } else if (subscriptionEvents.has(event.type)) {
    const subscription = event.data.object as Stripe.Subscription
    subscriptionId = subscription.id
    userId = subscription.metadata?.user_id ?? null
  } else {
    return { handled: false as const }
  }

  const subscription = await deps.getSubscription(subscriptionId)
  const update = billingFromSubscription(subscription)
  const saved = await deps.saveBilling(update, userId ?? subscription.metadata?.user_id ?? null)
  return { handled: true as const, update, username: saved?.username ?? null, matched: saved !== null }
}
