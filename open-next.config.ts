import { defineCloudflareConfig } from "@opennextjs/cloudflare"

const config = defineCloudflareConfig({
  // Cache setup (public pages use ISR) is added when the Worker is deployed; see README.
})

// Webpack instead of Turbopack for the production build: Turbopack copies the Supabase client into every
// route's server chunk, which pushes the Worker towards the 3 MiB limit of the free plan.
config.buildCommand = "npx next build --webpack"

export default config
