// Creates (once) the Porch Pro product, its $5/month price and the Customer Portal settings in Stripe test mode,
// then prints the price id for STRIPE_PRO_PRICE_ID. Safe to run again: it finds what already exists.
// Usage: npx dotenv -e .env.local -- node scripts/stripe-setup.mjs
import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY
if (!key?.startsWith("sk_test_")) throw new Error("Use a test-mode key (sk_test_...). Porch never touches live mode.")
const stripe = new Stripe(key)

const LOOKUP_KEY = "porch_pro_monthly"

let [price] = (await stripe.prices.list({ lookup_keys: [LOOKUP_KEY], active: true, limit: 1 })).data
if (!price) {
  const product = await stripe.products.create({
    name: "Porch Pro",
    description: "Unlimited links, every theme and click analytics.",
  })
  price = await stripe.prices.create({
    product: product.id,
    unit_amount: 500,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: LOOKUP_KEY,
    nickname: "Pro monthly",
  })
  console.log("Created product and price")
} else {
  console.log("Price already exists")
}

const configs = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 })
const portal = {
  business_profile: { headline: "Manage your Porch Pro subscription" },
  features: {
    customer_update: { enabled: true, allowed_updates: ["email"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
  },
}
if (configs.data[0]) {
  await stripe.billingPortal.configurations.update(configs.data[0].id, portal)
  console.log("Updated Customer Portal settings")
} else {
  await stripe.billingPortal.configurations.create(portal)
  console.log("Created Customer Portal settings")
}

console.log(`STRIPE_PRO_PRICE_ID=${price.id}`)
