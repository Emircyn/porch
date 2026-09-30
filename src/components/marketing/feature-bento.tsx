"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckIcon, CopyIcon, GripVerticalIcon } from "lucide-react"
import Link from "next/link"
import { useId, useState } from "react"

import { LinkIcon } from "@/components/profile/link-icon"
import { ThemeSwatch } from "@/components/theme-swatch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NumberTicker } from "@/components/ui/number-ticker"
import { demoLinks, demoStats, personaForTheme } from "@/lib/demo-profile"
import { siteHost } from "@/lib/site"
import { getTheme, themes, type ThemeId } from "@/lib/themes"
import { usernameSchema } from "@/lib/usernames"
import { cn } from "@/lib/utils"

function BentoCard({
  title,
  body,
  badge,
  className,
  children,
}: {
  title: string
  body: string
  badge?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <li className={cn("flex flex-col overflow-hidden rounded-2xl border bg-card", className)}>
      <div className="relative flex min-h-56 flex-1 items-center justify-center overflow-hidden border-b bg-muted/40 bg-dots p-6">
        {children}
      </div>
      <div className="flex flex-col gap-1.5 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {title}
          {badge ? <Badge>{badge}</Badge> : null}
        </h3>
        <p className="text-muted-foreground">{body}</p>
      </div>
    </li>
  )
}

export function FeatureBento() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      <BentoCard
        className="md:col-span-2"
        title="Drag links into order"
        body="Grab a handle and move it. Works with a mouse, a finger or the keyboard (space, arrows, space)."
      >
        <ReorderDemo />
      </BentoCard>

      <BentoCard
        title={`${themes.length} themes`}
        body={`Real shadcn themes. Three are free, all ${themes.length} come with Pro, and every one has a dark mode.`}
      >
        <ThemeDemo />
      </BentoCard>

      <BentoCard
        title="See what gets clicked"
        badge="Pro"
        body="Clicks per day and per link, counted without cookies. Only you can see them."
      >
        <StatsDemo />
      </BentoCard>

      <BentoCard
        className="md:col-span-2"
        title="One short address"
        body="Type a name to see yours. Put it in your Instagram bio, your e-mail signature or on a business card."
      >
        <AddressDemo />
      </BentoCard>
    </ul>
  )
}

function ReorderDemo() {
  const [items, setItems] = useState(() => demoLinks.slice(0, 4))
  const dndId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setItems((current) => {
      const ids = current.map((item) => item.id)
      return arrayMove(current, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    })
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ol className="flex w-full max-w-sm flex-col gap-2" aria-label="Demo links">
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id} title={item.title} url={item.url} position={index + 1} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, title, url, position }: { id: string; title: string; url: string; position: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-2 py-2 text-sm shadow-xs",
        isDragging && "relative z-10 border-primary/50 shadow-lg shadow-primary/15"
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Move ${title}, position ${position}`}
        className="flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <LinkIcon url={url} className="size-4" />
      </span>
      <span className="truncate font-medium">{title}</span>
    </li>
  )
}

function ThemeDemo() {
  const [themeId, setThemeId] = useState<ThemeId>("bubblegum")
  const theme = getTheme(themeId)
  const { profile } = personaForTheme(themeId)

  return (
    <div className="flex w-full items-center justify-center gap-4">
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-4 gap-1.5">
        {themes.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === themeId}
            aria-label={option.name}
            title={option.name}
            onClick={() => setThemeId(option.id)}
            className={cn(
              "overflow-hidden rounded-md border transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              option.id === themeId && "border-primary ring-2 ring-primary/40"
            )}
          >
            <ThemeSwatch theme={option} className="h-12 w-8 gap-1 p-1 [&>span:first-child]:size-2.5" />
          </button>
        ))}
      </div>

      <div
        data-page-theme={theme.id}
        aria-live="polite"
        className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-xl border bg-background p-3 font-sans text-foreground shadow-[var(--page-shadow-md)] motion-safe:transition-colors"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local demo avatar */}
        <img src={profile.avatarUrl!} alt="" className="size-10 rounded-full bg-muted" />
        <span className="line-clamp-1 text-center text-xs font-bold">{profile.displayName}</span>
        <span className="-mt-1.5 text-[10px] text-muted-foreground">{theme.name}</span>
        <span className="h-5 w-full rounded-[calc(var(--radius)*0.6)] bg-primary shadow-[var(--page-shadow-xs)]" />
        <span className="h-5 w-full rounded-[calc(var(--radius)*0.6)] border bg-card shadow-[var(--page-shadow-xs)]" />
      </div>
    </div>
  )
}

const ranges = [7, 14, 30] as const
const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

function StatsDemo() {
  const [range, setRange] = useState<(typeof ranges)[number]>(14)
  const [active, setActive] = useState<number | null>(null)
  const days = demoStats.daily.slice(-range)
  const total = days.reduce((sum, day) => sum + day.clicks, 0)
  const peak = Math.max(...days.map((day) => day.clicks))
  const shown = active !== null ? days[active] : null

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {shown ? dateLabel.format(new Date(shown.day)) : `Clicks, last ${range} days`}
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {shown ? shown.clicks : <NumberTicker value={total} startValue={total} />}
            <span className="sr-only">{shown ? "" : ` ${total} clicks`}</span>
          </p>
        </div>
        <div role="radiogroup" aria-label="Range" className="flex rounded-lg bg-muted p-0.5 text-xs">
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={option === range}
              onClick={() => {
                setRange(option)
                setActive(null)
              }}
              className={cn(
                "rounded-md px-2 py-1 font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                option === range ? "bg-background shadow-xs" : "text-foreground/75 hover:text-foreground"
              )}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>
      {/* One touch surface for the whole chart: 30 bars are too thin to tap one by one. */}
      <div
        role="img"
        aria-label={`Clicks per day over the last ${range} days, ${total} in total, peaking at ${peak}.`}
        className="flex h-24 cursor-crosshair touch-none items-end gap-[2px]"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          setActive(Math.min(days.length - 1, Math.max(0, Math.floor(((event.clientX - box.left) / box.width) * days.length))))
        }}
        onPointerDown={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          setActive(Math.min(days.length - 1, Math.max(0, Math.floor(((event.clientX - box.left) / box.width) * days.length))))
        }}
        onPointerLeave={() => setActive(null)}
      >
        {days.map((day, index) => (
          <span
            key={day.day}
            className={cn(
              "flex-1 rounded-t-[4px] transition-colors",
              active === null || active === index ? "bg-primary" : "bg-primary/30"
            )}
            style={{ height: `${(day.clicks / peak) * 100}%` }}
          />
        ))}
      </div>
      <ul className="sr-only">
        {days.map((day) => (
          <li key={day.day}>{`${dateLabel.format(new Date(day.day))}: ${day.clicks} clicks`}</li>
        ))}
      </ul>
    </div>
  )
}

function AddressDemo() {
  const [name, setName] = useState("maya")
  const [copied, setCopied] = useState(false)
  const parsed = usernameSchema.safeParse(name)
  const shown = name || "yourname"

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${siteHost}/${shown}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <p className="max-w-full truncate rounded-full border bg-card px-5 py-3 text-lg font-medium shadow-sm">
        {siteHost}/<span className="text-primary">{shown}</span>
      </p>
      <div className="flex w-full gap-2">
        <label htmlFor="bento-name" className="sr-only">
          Try a page name
        </label>
        <input
          id="bento-name"
          value={name}
          onChange={(event) => setName(event.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 30))}
          placeholder="yourname"
          autoComplete="off"
          spellCheck={false}
          className="h-10 min-w-0 flex-1 rounded-lg border bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <Button variant="outline" onClick={copy} className="h-10" aria-live="polite">
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button asChild className="h-10" aria-disabled={!parsed.success}>
          <Link href={parsed.success ? `/signup?username=${parsed.data}` : "/signup"}>Claim</Link>
        </Button>
      </div>
    </div>
  )
}
