import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProfileView } from "@/components/profile/profile-view"
import { getPublicPage } from "@/lib/public-page"
import { getTheme } from "@/lib/themes"

// Cached and refreshed at most once a minute; edits in the dashboard refresh it straight away.
export const revalidate = 60

// No pages are built ahead of time; each one is rendered on its first visit and then cached (ISR).
export function generateStaticParams() {
  return []
}

// Counts a click without cookies or a redirect: the link goes straight to its destination and the browser
// sends a small beacon on the side. Visitors without JavaScript still get where they are going.
const clickBeacon = `document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[data-link-id]");if(!a||!navigator.sendBeacon)return;var r="";try{r=document.referrer?new URL(document.referrer).hostname:""}catch(_){}navigator.sendBeacon("/api/click",JSON.stringify({id:a.getAttribute("data-link-id"),ref:r}))},{capture:true})`

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params
  const page = await getPublicPage(username)
  if (!page) return { title: "Page not found" }
  const name = page.profile.displayName || page.profile.username
  return {
    title: `${name} (@${page.profile.username})`,
    description: page.profile.bio || `${name}'s links on Porch`,
    openGraph: { title: name, description: page.profile.bio, type: "profile" },
  }
}

export default async function PublicPage({ params }: PageProps<"/[username]">) {
  const { username } = await params
  const page = await getPublicPage(username)
  if (!page) notFound()

  return (
    <main>
      <ProfileView
        profile={page.profile}
        links={page.links}
        theme={getTheme(page.profile.themeId)}
        nameAs="h1"
        colorMode="auto"
        className="min-h-svh"
      />
      <script dangerouslySetInnerHTML={{ __html: clickBeacon }} />
    </main>
  )
}
