import type { NextConfig } from "next"

// Lets the dev server be opened through Tailscale (e.g. https://claude-sandbox.tail064a54.ts.net:8443).
// Set DEV_TUNNEL_HOST in .env.local; unset in production, where these options do nothing.
const devTunnelHost = process.env.DEV_TUNNEL_HOST

const nextConfig: NextConfig = {
  ...(devTunnelHost && {
    allowedDevOrigins: [devTunnelHost.split(":")[0]],
    experimental: { serverActions: { allowedOrigins: [devTunnelHost] } },
  }),
}

export default nextConfig

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev())
