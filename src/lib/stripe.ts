import "server-only"

import Stripe from "stripe"

let client: Stripe | null = null

/** Test mode only, and fetch-based so it runs on Cloudflare Workers. */
export function getStripe() {
  if (client) return client
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  if (!key.startsWith("sk_test_")) throw new Error("Porch only runs Stripe in test mode")
  client = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
  return client
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider()
