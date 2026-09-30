import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache"
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue"
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache"

// Public pages use ISR (revalidate = 60, plus revalidatePath after every edit). Workers KV holds the cached
// pages and the revalidation tags, a Durable Object de-duplicates background refreshes. All three are on the
// Workers free plan and, unlike R2, need no activation in the dashboard.
const config = defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvNextTagCache,
  queue: doQueue,
})

// Webpack instead of Turbopack for the production build: Turbopack copies the Supabase client into every
// route's server chunk, which pushes the Worker towards the 3 MiB limit of the free plan.
config.buildCommand = "npx next build --webpack"

export default config
