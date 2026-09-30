import { ArrowUpRightIcon, PlayIcon } from "lucide-react"

import { LogoMark } from "@/components/logo"
import type { PublicLink, PublicProfile } from "@/lib/demo-profile"
import { BrandIcon, platforms } from "@/lib/platforms"
import type { PageTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { youtubeThumbnail, youtubeVideoId } from "@/lib/youtube"

import { LinkIcon } from "./link-icon"

type ProfileViewProps = {
  profile: Pick<PublicProfile, "displayName" | "username" | "bio" | "avatarUrl" | "socials">
  links: PublicLink[]
  theme: PageTheme
  /** Previews (landing page, editor) render links as plain text so they are not focusable. */
  interactive?: boolean
  nameAs?: "h1" | "p"
  getLinkHref?: (link: PublicLink) => string
  /** "auto" follows the visitor's system light/dark setting with CSS alone (public pages). */
  colorMode?: "auto"
  className?: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/**
 * A public Porch page. Every colour, font, radius and shadow comes from the shadcn variables of the page's
 * theme (src/app/page-themes.css), which follow the visitor's light or dark mode.
 */
export function ProfileView({
  profile,
  links,
  theme,
  interactive = true,
  nameAs: Name = "p",
  getLinkHref = (link) => link.url,
  colorMode,
  className,
}: ProfileViewProps) {
  const Anchor = interactive ? "a" : "div"
  const socials = profile.socials
    .map((social) => ({ ...social, platform: platforms.find((p) => p.id === social.platform) }))
    .filter((social) => social.platform)

  return (
    <div
      data-page-theme={theme.id}
      data-color-mode={colorMode}
      className={cn(
        "relative isolate min-h-full bg-background font-sans text-foreground [letter-spacing:var(--page-tracking)]",
        "motion-safe:transition-colors motion-safe:duration-300",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-primary/25 via-primary/8 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-[calc(3rem+var(--phone-safe-top,0px))] pb-8 text-center">
        <div className="size-24 overflow-hidden rounded-full bg-muted shadow-[var(--page-shadow-md)] ring-4 ring-background">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatars come from Supabase Storage at any size
            <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-full items-center justify-center bg-primary text-2xl font-semibold text-primary-foreground"
            >
              {initials(profile.displayName || profile.username)}
            </span>
          )}
        </div>

        <Name className="mt-4 line-clamp-2 text-xl leading-tight font-bold text-balance [overflow-wrap:anywhere]">{profile.displayName || profile.username}</Name>
        <p className="mt-0.5 text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio ? (
          <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-pretty text-muted-foreground [overflow-wrap:anywhere]">
            {profile.bio}
          </p>
        ) : null}

        {socials.length ? (
          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {socials.map(({ url, platform }) => (
              <li key={url}>
                <Anchor
                  {...(interactive
                    ? { href: url, rel: "noopener noreferrer me", "aria-label": platform!.name }
                    : {})}
                  className="flex size-10 items-center justify-center rounded-full border bg-card text-card-foreground shadow-[var(--page-shadow-xs)] transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <BrandIcon platform={platform!.id} className="size-4" />
                </Anchor>
              </li>
            ))}
          </ul>
        ) : null}

        {!interactive && links.length === 0 ? (
          // Editor preview of a brand-new page: show where links will go instead of an empty screen.
          <div className="mt-7 flex w-full flex-col gap-3" aria-hidden="true">
            {["Your first link", "Your second link", "And so on"].map((label, index) => (
              <div
                key={label}
                className="rounded-lg border-2 border-dashed p-4 text-center text-sm font-medium text-muted-foreground"
                style={{ opacity: 1 - index * 0.3 }}
              >
                {label}
              </div>
            ))}
          </div>
        ) : null}

        <ul className="mt-7 flex w-full flex-col gap-3">
          {links.map((link) => (
            <li key={link.id}>
              {link.layout === "featured" ? (
                <FeaturedLink link={link} href={interactive ? getLinkHref(link) : undefined} />
              ) : (
                <Anchor
                  {...linkProps(interactive ? getLinkHref(link) : undefined, link.id)}
                  className={cn(linkBase, "flex items-center gap-3 border bg-card p-1.5 pr-4 text-card-foreground")}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <LinkIcon url={link.url} className="size-[18px]" />
                  </span>
                  <LinkTitle className="flex-1 pr-10 text-center">{link.title}</LinkTitle>
                </Anchor>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Anchor
            {...(interactive ? { href: "/" } : {})}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <LogoMark className="size-4" />
            Made with Porch
          </Anchor>
          {interactive ? (
            <a
              href={`/${profile.username}/report`}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Report this page
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const linkBase =
  "group w-full rounded-lg shadow-[var(--page-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--page-shadow-md)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"

/** Props for a link: a real anchor on public pages (with the id the click counter reads), nothing in previews. */
function linkProps(href: string | undefined, id: string) {
  return href ? { href, rel: "noopener noreferrer", "data-link-id": id } : {}
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** A featured link: a video card for YouTube, a big coloured card for anything else. */
function FeaturedLink({ link, href }: { link: PublicLink; href?: string }) {
  const Anchor = href ? "a" : "div"
  const videoId = youtubeVideoId(link.url)

  if (videoId) {
    return (
      <Anchor
        {...linkProps(href, link.id)}
        className={cn(linkBase, "block overflow-hidden border bg-card text-left text-card-foreground")}
      >
        <span className="relative block aspect-video bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, any size */}
          <img src={youtubeThumbnail(videoId)} alt="" loading="lazy" className="size-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
              <PlayIcon className="ml-0.5 size-5 fill-current" />
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2.5 p-3">
          <BrandIcon platform="youtube" className="size-4 shrink-0" />
          <LinkTitle>{link.title}</LinkTitle>
        </span>
      </Anchor>
    )
  }

  return (
    <Anchor
      {...linkProps(href, link.id)}
      className={cn(
        linkBase,
        "relative flex flex-col items-start gap-5 overflow-hidden border border-primary bg-primary p-4 text-left text-primary-foreground"
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -top-10 -right-10 size-32 rounded-full bg-primary-foreground/10"
      />
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary-foreground/15">
        <LinkIcon url={link.url} className="size-5" />
      </span>
      <span className="flex w-full items-end justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <LinkTitle className="text-base font-bold">{link.title}</LinkTitle>
          <span className="truncate text-xs opacity-80">{hostOf(link.url)}</span>
        </span>
        <ArrowUpRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Anchor>
  )
}

/**
 * Link titles are the owner's own words and can be any length: wrap evenly, never overflow, and stop after two
 * lines so every button keeps the same rhythm. The full title stays available to screen readers and on hover.
 */
function LinkTitle({ children, className }: { children: string; className?: string }) {
  return (
    <span
      title={children}
      className={cn(
        "line-clamp-2 text-sm leading-snug font-semibold text-balance [overflow-wrap:anywhere]",
        className
      )}
    >
      {children}
    </span>
  )
}
