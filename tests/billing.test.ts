import type Stripe from "stripe"
import { describe, expect, it } from "vitest"

import { billingFromSubscription, periodEnd, planFromStatus } from "@/lib/billing"

function subscription(overrides: Partial<Stripe.Subscription> & Record<string, unknown> = {}) {
  return {
    id: "sub_123",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    cancel_at: null,
    metadata: {},
    items: { data: [{ current_period_end: 1_800_000_000 }] },
    ...overrides,
  } as unknown as Stripe.Subscription
}

describe("planFromStatus", () => {
  it.each(["active", "trialing", "past_due"] as const)("keeps Pro while %s", (status) => {
    expect(planFromStatus(status)).toBe("pro")
  })

  it.each(["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"] as const)(
    "drops to Free when %s",
    (status) => {
      expect(planFromStatus(status)).toBe("free")
    }
  )

  it("treats a missing subscription as Free", () => {
    expect(planFromStatus(null)).toBe("free")
  })
})

describe("billingFromSubscription", () => {
  it("maps an active subscription to Pro with its renewal date", () => {
    expect(billingFromSubscription(subscription())).toEqual({
      plan: "pro",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      subscription_status: "active",
      current_period_end: new Date(1_800_000_000 * 1000).toISOString(),
      cancel_at_period_end: false,
    })
  })

  it("flags a subscription that ends at the period end", () => {
    expect(billingFromSubscription(subscription({ cancel_at_period_end: true })).cancel_at_period_end).toBe(true)
    expect(billingFromSubscription(subscription({ cancel_at: 1_800_000_000 })).cancel_at_period_end).toBe(true)
  })

  it("accepts an expanded customer object", () => {
    const update = billingFromSubscription(subscription({ customer: { id: "cus_456" } as Stripe.Customer }))
    expect(update.stripe_customer_id).toBe("cus_456")
  })

  it("reads the period from older API versions too", () => {
    const old = subscription({ items: { data: [] } as never, current_period_end: 1_700_000_000 })
    expect(periodEnd(old)).toBe(new Date(1_700_000_000 * 1000).toISOString())
  })
})
