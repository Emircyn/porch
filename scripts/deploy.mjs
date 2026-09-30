// One-command deploy to Cloudflare Workers. Without --yes it only prints the plan and changes nothing.
//
//   node scripts/deploy.mjs          # dry run: show what would happen
//   node scripts/deploy.mjs --yes    # do it
//
// Needs: `wrangler login` done, and in .env.local the Supabase and Stripe keys, SUPABASE_ACCESS_TOKEN
// (to update auth redirect URLs) and STRIPE_PRO_PRICE_ID. Steps are idempotent; running it again redeploys.
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import Stripe from "stripe"

const apply = process.argv.includes("--yes")
const WORKER = "porch"
const KV = { NEXT_INC_CACHE_KV: "porch-next-inc-cache", NEXT_TAG_CACHE_KV: "porch-next-tag-cache" }
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]
// Runtime secrets for the Worker. NEXT_PUBLIC_* values are baked in at build time instead.
const SECRET_NAMES = ["SUPABASE_SECRET_KEY", "STRIPE_SECRET_KEY", "STRIPE_PRO_PRICE_ID"]

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)])
)
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ACCESS_TOKEN", ...SECRET_NAMES]) {
  if (!env[name]) throw new Error(`${name} is missing from .env.local`)
}
if (!env.STRIPE_SECRET_KEY.startsWith("sk_test_")) throw new Error("Porch only deploys with a Stripe test key")

const step = (message) => console.log(`\n${apply ? "▶" : "•"} ${message}`)
const wrangler = (...args) => execFileSync("npx", ["wrangler", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })

// 1. Where the Worker will live.
const account = JSON.parse(wrangler("whoami", "--json")).accounts[0]
const token = fs
  .readFileSync(path.join(os.homedir(), ".config/.wrangler/config/default.toml"), "utf8")
  .match(/oauth_token\s*=\s*"([^"]+)"/)?.[1]
const subdomain = (
  await (
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${account.id}/workers/subdomain`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json()
).result?.subdomain
if (!subdomain) throw new Error("Could not read the workers.dev subdomain; run `npx wrangler login`")
const site = `https://${WORKER}.${subdomain}.workers.dev`
step(`Site: ${site} (account ${account.name})`)

// 2. KV namespaces for the ISR cache.
const existing = JSON.parse(wrangler("kv", "namespace", "list"))
let config = fs.readFileSync("wrangler.jsonc", "utf8")
for (const [binding, title] of Object.entries(KV)) {
  let id = existing.find((ns) => ns.title === title)?.id
  if (!id) {
    step(`Create KV namespace ${title}`)
    if (apply) id = wrangler("kv", "namespace", "create", title).match(/"?id"?\s*[:=]\s*"([0-9a-f]{32})"/)?.[1]
  } else {
    step(`KV namespace ${title} exists (${id})`)
  }
  if (id) config = config.replace(new RegExp(`("binding": "${binding}", "id": ")[^"]+(")`), `$1${id}$2`)
}
if (apply) fs.writeFileSync("wrangler.jsonc", config)

// 3. Stripe webhook endpoint for the live URL.
const stripe = new Stripe(env.STRIPE_SECRET_KEY)
const webhookUrl = `${site}/api/stripe/webhook`
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
let webhookSecret = null
const endpoint = endpoints.data.find((e) => e.url === webhookUrl)
if (endpoint) {
  step(`Stripe webhook exists for ${webhookUrl} (secret already on the Worker)`)
} else {
  step(`Create Stripe webhook ${webhookUrl}`)
  if (apply) {
    const created = await stripe.webhookEndpoints.create({ url: webhookUrl, enabled_events: WEBHOOK_EVENTS })
    webhookSecret = created.secret
  }
}

// 4. Secrets.
const secrets = Object.fromEntries(SECRET_NAMES.map((name) => [name, env[name]]))
if (webhookSecret) secrets.STRIPE_WEBHOOK_SECRET = webhookSecret
step(`Upload Worker secrets: ${Object.keys(secrets).join(", ")}`)
if (apply) {
  const file = path.join(os.tmpdir(), `porch-secrets-${process.pid}.json`)
  fs.writeFileSync(file, JSON.stringify(secrets), { mode: 0o600 })
  try {
    wrangler("secret", "bulk", file, "--name", WORKER)
  } finally {
    fs.rmSync(file)
  }
}

// 5. Supabase auth: the live site becomes the Site URL; localhost and tunnels stay allowed.
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
const authUrl = `https://api.supabase.com/v1/projects/${ref}/config/auth`
const authHeaders = { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" }
const auth = await (await fetch(authUrl, { headers: authHeaders })).json()
const allow = new Set((auth.uri_allow_list ?? "").split(",").filter(Boolean))
allow.add(`${site}/**`)
step(`Supabase auth: site_url=${site}, redirect URLs=${[...allow].join(", ")}`)
if (apply) {
  const res = await fetch(authUrl, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ site_url: site, uri_allow_list: [...allow].join(",") }),
  })
  if (!res.ok) throw new Error(`Supabase auth update failed: ${res.status}`)
}

// 6. Build (public URL baked in) and deploy.
step("Build with OpenNext and deploy")
if (apply) {
  const buildEnv = { ...process.env, ...env, NEXT_PUBLIC_SITE_URL: site, DEV_TUNNEL_HOST: "" }
  execFileSync("npx", ["opennextjs-cloudflare", "build"], { stdio: "inherit", env: buildEnv })
  execFileSync("npx", ["opennextjs-cloudflare", "deploy"], { stdio: "inherit", env: buildEnv })
  console.log(`\nLive: ${site}\nDemo: ${site}/demo`)
} else {
  console.log("\nDry run only. Run again with --yes to deploy.")
}
