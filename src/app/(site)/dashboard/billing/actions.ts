"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getCurrentProfile } from "@/lib/profile"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

async function origin() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
}

/** The user's Stripe customer, created once. Only the server may write stripe_customer_id. */
async function ensureCustomer(): Promise<string> {
  const { profile, email } = await getCurrentProfile()
  if (profile.stripe_customer_id) return profile.stripe_customer_id

  const customer = await getStripe().customers.create(
    { email: email ?? undefined, name: profile.display_name || profile.username || undefined, metadata: { user_id: profile.id } },
    // Two quick clicks must not create two customers.
    { idempotencyKey: `porch-customer-${profile.id}` }
  )
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", profile.id)
  if (error) throw new Error("Could not save the Stripe customer")
  return customer.id
}

export async function startCheckout() {
  const { profile } = await getCurrentProfile()
  if (profile.plan === "pro") redirect("/dashboard/billing")

  const price = process.env.STRIPE_PRO_PRICE_ID
  if (!price) throw new Error("STRIPE_PRO_PRICE_ID is not set")
  const base = await origin()

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: await ensureCustomer(),
    client_reference_id: profile.id,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { user_id: profile.id } },
    success_url: `${base}/dashboard/billing?checkout=success`,
    cancel_url: `${base}/dashboard/billing?checkout=cancelled`,
  })
  if (!session.url) throw new Error("Stripe did not return a checkout URL")
  redirect(session.url)
}

export async function openBillingPortal() {
  const session = await getStripe().billingPortal.sessions.create({
    customer: await ensureCustomer(),
    return_url: `${await origin()}/dashboard/billing`,
  })
  redirect(session.url)
}
