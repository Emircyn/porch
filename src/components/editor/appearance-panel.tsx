"use client"

import { CheckIcon, LockIcon } from "lucide-react"
import { toast } from "sonner"

import { ThemeSwatch } from "@/components/theme-swatch"
import { Badge } from "@/components/ui/badge"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PublicProfile } from "@/lib/demo-profile"
import { themes, type ThemeId } from "@/lib/themes"
import { cn } from "@/lib/utils"

const BIO_LIMIT = 160

type AppearancePanelProps = {
  profile: PublicProfile
  plan: "free" | "pro"
  onProfileChange: (patch: Partial<Pick<PublicProfile, "displayName" | "bio">>) => void
  onThemeChange: (themeId: ThemeId) => void
}

export function AppearancePanel({ profile, plan, onProfileChange, onThemeChange }: AppearancePanelProps) {
  return (
    <div className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
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

      <FieldSet>
        <FieldLegend>Theme</FieldLegend>
        <FieldDescription>Every theme follows your visitor&apos;s light or dark mode.</FieldDescription>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {themes.map((theme) => {
            const locked = theme.pro && plan !== "pro"
            const selected = profile.themeId === theme.id
            return (
              <button
                key={theme.id}
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
            )
          })}
        </div>
      </FieldSet>
    </div>
  )
}
