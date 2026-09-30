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
import {
  CheckIcon,
  GripVerticalIcon,
  LinkIcon as LinkGlyph,
  PencilIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { useId, useState } from "react"
import * as z from "zod/mini"

import { LinkIcon } from "@/components/profile/link-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { EditorLink } from "@/lib/demo-profile"
import { FREE_LINK_LIMIT } from "@/lib/plans"
import { suggestTitle } from "@/lib/suggest-title"
import { cn } from "@/lib/utils"

const linkSchema = z.object({
  title: z.string().check(z.trim(), z.minLength(1, "Give the link a title."), z.maxLength(80, "Keep it under 80 characters.")),
  url: z.pipe(
    z.pipe(
      z.string().check(z.trim()),
      z.transform((value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
    ),
    z.url({ protocol: /^https?$/, error: "Enter a web address, like example.com." })
  ),
})

export type LinkInput = z.infer<typeof linkSchema>

type LinksPanelProps = {
  links: EditorLink[]
  plan: "free" | "pro"
  onAdd: (input: LinkInput) => void
  onUpdate: (id: string, patch: Partial<Omit<EditorLink, "id">>) => void
  onRemove: (id: string) => void
  onReorder: (ids: string[]) => void
}

export function LinksPanel({ links, plan, onAdd, onUpdate, onRemove, onReorder }: LinksPanelProps) {
  const dndId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const atLimit = plan === "free" && links.length >= FREE_LINK_LIMIT

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const ids = links.map((link) => link.id)
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    <div className="flex flex-col gap-4">
      <AddLinkDialog onAdd={onAdd} disabled={atLimit} />
      {atLimit ? (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
          The free plan has room for {FREE_LINK_LIMIT} links. <span className="font-medium">Pro</span> removes the
          limit.
        </p>
      ) : null}

      {links.length === 0 ? (
        <Empty className="border border-dashed py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LinkGlyph />
            </EmptyMedia>
            <EmptyTitle>No links yet</EmptyTitle>
            <EmptyDescription>Add your first link and it shows up on your page right away.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <SortableLinkRow key={link.id} link={link} onUpdate={onUpdate} onRemove={onRemove} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableLinkRow({
  link,
  onUpdate,
  onRemove,
}: {
  link: EditorLink
  onUpdate: LinksPanelProps["onUpdate"]
  onRemove: LinksPanelProps["onRemove"]
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })
  const [editing, setEditing] = useState(false)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative flex items-center gap-2 rounded-xl border bg-card p-2 pr-3 transition-shadow",
        isDragging && "z-10 border-primary/50 shadow-lg shadow-primary/10",
        !link.enabled && "bg-muted/50"
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Reorder ${link.title}`}
        className="flex h-10 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted",
          !link.enabled && "opacity-50"
        )}
      >
        <LinkIcon url={link.url} className="size-[18px]" />
      </span>

      {editing ? (
        <InlineEdit
          link={link}
          onSave={(input) => {
            onUpdate(link.id, input)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "group flex min-w-0 flex-1 flex-col rounded-md px-1 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              !link.enabled && "opacity-60"
            )}
          >
            <span className="flex items-center gap-1.5 truncate text-sm font-medium">
              <span className="truncate">{link.title}</span>
              <PencilIcon className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </span>
            <span className="truncate text-xs text-muted-foreground">{link.url.replace(/^https?:\/\//, "")}</span>
          </button>
          {!link.enabled ? (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Hidden
            </Badge>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className={cn("size-8", link.layout === "featured" ? "text-primary" : "text-muted-foreground")}
            onClick={() => onUpdate(link.id, { layout: link.layout === "featured" ? "classic" : "featured" })}
            aria-pressed={link.layout === "featured"}
            aria-label={link.layout === "featured" ? `Stop featuring ${link.title}` : `Feature ${link.title}`}
            title={link.layout === "featured" ? "Featured: shown as a big card" : "Feature this link"}
          >
            <StarIcon className={cn(link.layout === "featured" && "fill-current")} />
          </Button>
          <Switch
            checked={link.enabled}
            onCheckedChange={(enabled) => onUpdate(link.id, { enabled })}
            aria-label={link.enabled ? `Hide ${link.title}` : `Show ${link.title}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(link.id)}
            aria-label={`Delete ${link.title}`}
          >
            <Trash2Icon />
          </Button>
        </>
      )}
    </li>
  )
}

function InlineEdit({
  link,
  onSave,
  onCancel,
}: {
  link: EditorLink
  onSave: (input: LinkInput) => void
  onCancel: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-1.5"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const parsed = linkSchema.safeParse({ title: data.get("title"), url: data.get("url") })
        if (!parsed.success) return setError(parsed.error.issues[0].message)
        onSave(parsed.data)
      }}
      onKeyDown={(event) => event.key === "Escape" && onCancel()}
    >
      <div className="flex items-center gap-1.5">
        <Input name="title" defaultValue={link.title} aria-label="Title" className="h-8" autoFocus />
        <Button type="submit" size="icon" className="size-8 shrink-0" aria-label="Save link">
          <CheckIcon />
        </Button>
      </div>
      <Input name="url" defaultValue={link.url} aria-label="Address" className="h-8 text-xs" />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function AddLinkDialog({ onAdd, disabled }: { onAdd: (input: LinkInput) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<"title" | "url", string>>>({})
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const suggestion = suggestTitle(url)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setErrors({})
        setUrl("")
        setTitle("")
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="h-11 w-full rounded-xl" disabled={disabled}>
          <PlusIcon /> Add link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const parsed = linkSchema.safeParse({ title: title.trim() || suggestion || "", url })
            if (!parsed.success) {
              const next: typeof errors = {}
              for (const issue of parsed.error.issues) next[issue.path[0] as "title" | "url"] ??= issue.message
              return setErrors(next)
            }
            onAdd(parsed.data)
            setOpen(false)
          }}
        >
          <DialogHeader>
            <DialogTitle>Add a link</DialogTitle>
            <DialogDescription>It goes to the top of your page. Drag it anywhere later.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-6 gap-4">
            <Field data-invalid={!!errors.url}>
              <FieldLabel htmlFor="new-link-url">Address</FieldLabel>
              <Input
                id="new-link-url"
                name="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="youtube.com/@you"
                inputMode="url"
                autoComplete="off"
                aria-invalid={!!errors.url}
                autoFocus
              />
              <FieldError>{errors.url}</FieldError>
            </Field>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="new-link-title">Title</FieldLabel>
              <Input
                id="new-link-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={suggestion ?? "My latest video"}
                maxLength={80}
                aria-invalid={!!errors.title}
              />
              {errors.title ? (
                <FieldError>{errors.title}</FieldError>
              ) : (
                <TitleHint title={title} suggestion={suggestion} />
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Add link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const LONG_TITLE = 40

/** Keeps people ahead of the preview: an empty title uses the suggestion, a long one wraps to two lines. */
function TitleHint({ title, suggestion }: { title: string; suggestion: string | null }) {
  const length = title.trim().length
  if (length === 0) {
    return (
      <FieldDescription>
        {suggestion ? `Leave it empty to use “${suggestion}”.` : "A few words people can scan at a glance."}
      </FieldDescription>
    )
  }
  return (
    <FieldDescription className="flex justify-between gap-3">
      <span>{length > LONG_TITLE ? "Long titles wrap onto two lines. Shorter reads better." : "\u00a0"}</span>
      <span className={cn("tabular-nums", length > LONG_TITLE && "text-foreground")}>{length}/80</span>
    </FieldDescription>
  )
}
