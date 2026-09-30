import { describe, expect, it } from "vitest"

import { editorReducer, type EditorState } from "@/components/editor/editor-state"
import { demoLinks, demoProfile } from "@/lib/demo-profile"
import { platformForUrl } from "@/lib/platforms"
import { suggestTitle } from "@/lib/suggest-title"
import { themes } from "@/lib/themes"
import { usernameSchema } from "@/lib/usernames"
import { youtubeVideoId } from "@/lib/youtube"

describe("youtubeVideoId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10", "dQw4w9WgXcQ"],
  ])("finds the id in %s", (url, id) => expect(youtubeVideoId(url)).toBe(id))

  it.each(["https://youtube.com/@maya", "https://example.com/watch?v=dQw4w9WgXcQ", "not a url"])(
    "returns null for %s",
    (url) => expect(youtubeVideoId(url)).toBeNull()
  )
})

describe("suggestTitle", () => {
  it.each([
    ["youtube.com/watch?v=dQw4w9WgXcQ", "Watch on YouTube"],
    ["https://www.etsy.com/shop/maya", "Shop on Etsy"],
    ["cal.com/maya/intro", "Book a call"],
    ["maya.substack.com", "Read my newsletter"],
    ["example.org/about", "example.org"],
  ])("suggests a title for %s", (url, title) => expect(suggestTitle(url)).toBe(title))

  it("stays quiet until the address looks like one", () => expect(suggestTitle("youtu")).toBeNull())
})

describe("platformForUrl", () => {
  it("matches subdomains but not look-alikes", () => {
    expect(platformForUrl("https://open.spotify.com/x")?.id).toBe("spotify")
    expect(platformForUrl("https://notinstagram.com")).toBeNull()
  })
})

describe("usernameSchema", () => {
  it("lower-cases valid names", () => expect(usernameSchema.parse("  Maya.Makes ")).toBe("maya.makes"))
  it.each(["ab", "has space", "dashboard", "a".repeat(31)])("rejects %s", (name) =>
    expect(usernameSchema.safeParse(name).success).toBe(false)
  )
})

describe("themes", () => {
  it("has three free themes and keeps the free ones first", () => {
    expect(themes.filter((t) => !t.pro)).toHaveLength(3)
    expect(themes.findIndex((t) => t.pro)).toBe(3)
  })
})

describe("editorReducer", () => {
  const start: EditorState = { profile: demoProfile, links: demoLinks }

  it("adds new links to the top", () => {
    const link = { id: "new", title: "New", url: "https://example.com", layout: "classic" as const, enabled: true }
    expect(editorReducer(start, { type: "add-link", link }).links[0].id).toBe("new")
  })

  it("restores a deleted link where it was", () => {
    const removed = start.links[2]
    const without = editorReducer(start, { type: "remove-link", id: removed.id })
    const back = editorReducer(without, { type: "restore-link", link: removed, index: 2 })
    expect(back.links.map((l) => l.id)).toEqual(start.links.map((l) => l.id))
  })

  it("reorders by id and ignores unknown ids", () => {
    const ids = start.links.map((l) => l.id).reverse()
    const next = editorReducer(start, { type: "reorder", ids: [...ids, "ghost"] })
    expect(next.links.map((l) => l.id)).toEqual(ids)
  })
})
