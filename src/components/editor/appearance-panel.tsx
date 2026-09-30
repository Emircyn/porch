"use client"

import { CameraIcon, CheckIcon, EyeIcon, LockIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"

import { ThemeSwatch } from "@/components/theme-swatch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PublicProfile, SocialLink } from "@/lib/demo-profile"
import { BrandIcon, platforms } from "@/lib/platforms"
import { themes, type ThemeId } from "@/lib/themes"
import { cn } from "@/lib/utils"

const BIO_LIMIT = 160

const MAX_SOCIALS = 8

type AppearancePanelProps = {
  profile: PublicProfile
  plan: "free" | "pro"
  uploadingAvatar: boolean
  onProfileChange: (patch: Partial<Pick<PublicProfile, "displayName" | "bio">>) => void
  onAvatarChange: (file: File | null) => void
  onSocialsChange: (socials: SocialLink[]) => void
  onThemeChange: (themeId: ThemeId) => void
}

export function AppearancePanel({
  profile,
  plan,
  uploadingAvatar,
  onProfileChange,
  onAvatarChange,
  onSocialsChange,
  onThemeChange,
}: AppearancePanelProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const initials = (profile.displayName || profile.username).slice(0, 1).toUpperCase()

  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <div className="flex items-center gap-4">
          <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user photo from Storage
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              initials
            )}
            {uploadingAvatar ? (
              <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Spinner />
              </span>
            ) : null}
          </span>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                if (file.size > 8 * 1024 * 1024) {
                  toast.error("That photo is over 8 MB. Pick a smaller one.")
                } else {
                  onAvatarChange(file)
                }
                event.target.value = ""
              }}
            />
            <Button variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => fileInput.current?.click()}>
              <CameraIcon /> {profile.avatarUrl ? "Change photo" : "Add a photo"}
            </Button>
            {profile.avatarUrl ? (
              <Button variant="ghost" size="sm" disabled={uploadingAvatar} onClick={() => onAvatarChange(null)}>
                <XIcon /> Remove
              </Button>
            ) : null}
          </div>
        </div>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
            <Input
              id="profile-name"
              value={profile.displayName}
              maxLength={60}
              onChange={(event) => onProfileChange({ displayName: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
            <Textarea
              id="profile-bio"
              value={profile.bio}
              maxLength={BIO_LIMIT}
              rows={3}
              className="resize-none"
              aria-describedby="profile-bio-count"
              onChange={(event) => onProfileChange({ bio: event.target.value })}
            />
            <FieldDescription id="profile-bio-count" className="text-right tabular-nums">
              {profile.bio.length}/{BIO_LIMIT}
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>

      <SocialsEditor socials={profile.socials} onChange={onSocialsChange} />

      <FieldSet>
        <FieldLegend>Theme</FieldLegend>
        <FieldDescription>Every theme follows your visitor&apos;s light or dark mode.</FieldDescription>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {themes.map((theme) => {
            const locked = theme.pro && plan !== "pro"
            const selected = profile.themeId === theme.id
            return (
              <div key={theme.id} className="group/card relative">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  if (locked) {
                    toast(`${theme.name} is a Pro theme`, { description: "Upgrade to Pro to use every theme." })
                    return
                  }
                  onThemeChange(theme.id)
                }}
                className="group flex flex-col gap-1.5 text-left focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative block overflow-hidden rounded-xl border transition-all group-hover:border-primary/40 group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                    selected && "border-primary ring-2 ring-primary/40"
                  )}
                >
                  <ThemeSwatch theme={theme} className="h-24" />
                  {selected ? (
                    <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckIcon className="size-3" />
                    </span>
                  ) : locked ? (
                    <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground">
                      <LockIcon className="size-3" />
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center justify-between gap-1 text-xs font-medium">
                  <span className="truncate">{theme.name}</span>
                  {theme.pro ? (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                      Pro
                    </Badge>
                  ) : null}
                </span>
              </button>
              {/* A sibling, not inside the button: opens the full-size preview in a new tab. */}
              <a
                href={`/themes/${theme.id}`}
                target="_blank"
                rel="noopener"
                aria-label={`Preview ${theme.name} full size (opens in a new tab)`}
                title="Preview full size"
                className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none max-sm:opacity-100"
              >
                <EyeIcon className="size-3.5" />
              </a>
              </div>
            )
          })}
        </div>
      </FieldSet>
    </div>
  )
}

function withProtocol(value: string) {
  const trimmed = value.trim()
  return !trimmed || /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** A row of brand icons under the bio. Addresses get https:// added when you leave the field. */
function SocialsEditor({ socials, onChange }: { socials: SocialLink[]; onChange: (socials: SocialLink[]) => void }) {
  const unused = platforms.filter((platform) => !socials.some((social) => social.platform === platform.id))

  return (
    <FieldSet>
      <FieldLegend>Social icons</FieldLegend>
      <FieldDescription>Shown as small icons under your bio, up to {MAX_SOCIALS}.</FieldDescription>
      {socials.length ? (
        <ul className="flex flex-col gap-2">
          {socials.map((social, index) => {
            const platform = platforms.find((p) => p.id === social.platform)
            if (!platform) return null
            return (
              <li key={social.platform} className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted" title={platform.name}>
                  <BrandIcon platform={platform.id} className="size-4" />
                </span>
                <Input
                  aria-label={`${platform.name} address`}
                  value={social.url}
                  placeholder={`${platform.hosts[0]}/you`}
                  inputMode="url"
                  onChange={(event) =>
                    onChange(socials.map((s, i) => (i === index ? { ...s, url: event.target.value } : s)))
                  }
                  onBlur={(event) => {
                    const url = withProtocol(event.target.value)
                    if (url !== social.url) onChange(socials.map((s, i) => (i === index ? { ...s, url } : s)))
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${platform.name}`}
                  onClick={() => onChange(socials.filter((_, i) => i !== index))}
                >
                  <Trash2Icon />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit" disabled={socials.length >= MAX_SOCIALS || !unused.length}>
            <PlusIcon /> Add a social icon
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
          {unused.map((platform) => (
            <DropdownMenuItem key={platform.id} onSelect={() => onChange([...socials, { platform: platform.id, url: "" }])}>
              <BrandIcon platform={platform.id} className="size-4" />
              {platform.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FieldSet>
  )
}
