import { revalidatePath } from "next/cache"
import type Stripe from "stripe"

import { createAdminClient } from "@/lib/supabase/admin"
import { cryptoProvider, getStripe } from "@/lib/stripe"
import { handleStripeEvent, type WebhookDeps } from "@/lib/stripe-webhook"

// The only door through which a plan changes. Stripe signs every call; anything unsigned is refused.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return new Response("Missing signature", { status: 400 })

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret, undefined, cryptoProvider)
  } catch {
    return new Response("Invalid signature", { status: 400 })
  }

  const admin = createAdminClient()
  const deps: WebhookDeps = {
    getSubscription: (id) => stripe.subscriptions.retrieve(id),
    async saveBilling(update, userId) {
      // Match on the customer first; fall back to the user id we put in the checkout metadata.
      const byCustomer = await admin
        .from("profiles")
        .update(update)
        .eq("stripe_customer_id", update.stripe_customer_id)
        .select("username")
      if (byCustomer.error) throw byCustomer.error
      if (byCustomer.data.length) return byCustomer.data[0]
      if (!userId) return null
      const byUser = await admin.from("profiles").update(update).eq("id", userId).select("username")
      if (byUser.error) throw byUser.error
      return byUser.data[0] ?? null
    },
  }

  try {
    const result = await handleStripeEvent(event, deps)
    if (result.handled && result.username) revalidatePath(`/${result.username}`)
    return Response.json({ received: true, handled: result.handled })
  } catch (error) {
    // A 500 makes Stripe retry later, which is what we want if the database hiccups.
    console.error("stripe webhook failed", event.type, error)
    return new Response("Webhook handler failed", { status: 500 })
  }
}
