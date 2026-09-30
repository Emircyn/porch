/** Host shown in example URLs ("porch.page/maya"). Follows NEXT_PUBLIC_SITE_URL once the app is deployed. */
function hostFromEnv() {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (!url || url.includes("localhost")) return "porch.page"
  return new URL(url).host
}

export const siteHost = hostFromEnv()
