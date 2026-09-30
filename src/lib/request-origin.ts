import type { NextRequest } from "next/server"

/** The origin the visitor used, including behind a proxy (Tailscale in dev, Cloudflare in production). */
export function requestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host")
  if (!host) return request.nextUrl.origin
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0] ?? "https"
  return `${proto}://${host.split(",")[0].trim()}`
}
