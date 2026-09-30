import Stripe from "stripe"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { handleStripeEvent, type WebhookDeps } from "@/lib/stripe-webhook"

function sub(status: Stripe.Subscription.Status, extra: Record<string, unknown> = {}) {
  return {
    id: "sub_1",
    customer: "cus_1",
    status,
    cancel_at_period_end: false,
    cancel_at: null,
    metadata: { user_id: "user_1" },
    items: { data: [{ current_period_end: 1_800_000_000 }] },
    ...extra,
  } as unknown as Stripe.Subscription
}

function event(type: string, object: Record<string, unknown>) {
  return { id: "evt_1", type, data: { object } } as unknown as Stripe.Event
}

describe("handleStripeEvent", () => {
  let deps: WebhookDeps
  let current: Stripe.Subscription

  beforeEach(() => {
    current = sub("active")
    deps = {
      getSubscription: vi.fn(async () => current),
      saveBilling: vi.fn(async () => ({ username: "maya" })),
    }
  })

  it("turns on Pro after checkout, using the fresh subscription", async () => {
    const result = await handleStripeEvent(
      event("checkout.session.completed", { mode: "subscription", subscription: "sub_1", client_reference_id: "user_1" }),
      deps
    )
    expect(deps.getSubscription).toHaveBeenCalledWith("sub_1")
    expect(deps.saveBilling).toHaveBeenCalledWith(expect.objectContaining({ plan: "pro", stripe_customer_id: "cus_1" }), "user_1")
    expect(result).toMatchObject({ handled: true, username: "maya" })
  })

  it("turns Pro off when the subscription is deleted", async () => {
    current = sub("canceled")
    await handleStripeEvent(event("customer.subscription.deleted", sub("canceled") as never), deps)
    expect(deps.saveBilling).toHaveBeenCalledWith(expect.objectContaining({ plan: "free", subscription_status: "canceled" }), "user_1")
  })

  it("trusts Stripe's current state over a late event", async () => {
    // An old "updated: active" event arrives after the subscription was already cancelled.
    current = sub("canceled")
    await handleStripeEvent(event("customer.subscription.updated", sub("active") as never), deps)
    expect(deps.saveBilling).toHaveBeenCalledWith(expect.objectContaining({ plan: "free" }), "user_1")
  })

  it("is safe to receive twice", async () => {
    const e = event("customer.subscription.updated", sub("active") as never)
    await handleStripeEvent(e, deps)
    await handleStripeEvent(e, deps)
    const calls = vi.mocked(deps.saveBilling).mock.calls
    expect(calls[0]).toEqual(calls[1])
  })

  it("ignores one-off payments and unrelated events", async () => {
    expect(await handleStripeEvent(event("checkout.session.completed", { mode: "payment" }), deps)).toEqual({ handled: false })
    expect(await handleStripeEvent(event("invoice.created", {}), deps)).toEqual({ handled: false })
    expect(deps.saveBilling).not.toHaveBeenCalled()
  })

  it("reports when no profile matched", async () => {
    deps.saveBilling = vi.fn(async () => null)
    const result = await handleStripeEvent(event("customer.subscription.created", sub("active") as never), deps)
    expect(result).toMatchObject({ handled: true, matched: false })
  })
})

describe("webhook signatures", () => {
  const stripe = new Stripe("sk_test_dummy", { httpClient: Stripe.createFetchHttpClient() })
  const crypto = Stripe.createSubtleCryptoProvider()
  const secret = "whsec_test_secret"
  const payload = JSON.stringify({ id: "evt_1", object: "event", type: "invoice.created", data: { object: {} } })

  it("accepts a correctly signed payload with WebCrypto (as on Workers)", async () => {
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret })
    const verified = await stripe.webhooks.constructEventAsync(payload, header, secret, undefined, crypto)
    expect(verified.id).toBe("evt_1")
  })

  it("rejects a payload signed with another secret", async () => {
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret: "whsec_wrong" })
    await expect(stripe.webhooks.constructEventAsync(payload, header, secret, undefined, crypto)).rejects.toThrow()
  })

  it("rejects a tampered payload", async () => {
    const header = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret })
    const tampered = payload.replace("invoice.created", "customer.subscription.updated")
    await expect(stripe.webhooks.constructEventAsync(tampered, header, secret, undefined, crypto)).rejects.toThrow()
  })
})
