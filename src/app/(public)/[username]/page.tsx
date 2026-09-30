import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProfileView } from "@/components/profile/profile-view"
import { getPublicPage } from "@/lib/public-page"
import { getTheme } from "@/lib/themes"

// Cached for a day: a page only changes when its owner edits it or their plan changes, and both refresh it
// straight away (revalidatePath). Rare background re-renders keep the Worker inside the free plan's CPU limit.
export const revalidate = 86400

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
  const description = page.profile.bio || `${name}'s links on Porch`
  // A card in the page's own theme; the name and bio come through as the preview's title and text.
  const images = [
    { url: `/og/pages/${page.profile.themeId}.jpg`, width: 1200, height: 630, alt: `${name} on Porch` },
  ]
  return {
    title: `${name} (@${page.profile.username})`,
    description,
    openGraph: { title: name, description, images, type: "profile", url: `/${page.profile.username}` },
    twitter: { card: "summary_large_image", title: name, description, images },
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
