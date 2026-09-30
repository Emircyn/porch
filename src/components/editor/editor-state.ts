import type { EditorLink, PublicProfile } from "@/lib/demo-profile"
import type { ThemeId } from "@/lib/themes"

export type EditorState = {
  profile: PublicProfile
  links: EditorLink[]
}

export type EditorAction =
  | { type: "profile"; patch: Partial<Pick<PublicProfile, "displayName" | "bio">> }
  | { type: "theme"; themeId: ThemeId }
  | { type: "add-link"; link: EditorLink }
  | { type: "update-link"; id: string; patch: Partial<Omit<EditorLink, "id">> }
  | { type: "remove-link"; id: string }
  | { type: "restore-link"; link: EditorLink; index: number }
  | { type: "reorder"; ids: string[] }
  | { type: "reset"; state: EditorState }

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "profile":
      return { ...state, profile: { ...state.profile, ...action.patch } }
    case "theme":
      return { ...state, profile: { ...state.profile, themeId: action.themeId } }
    case "add-link":
      // New links go to the top, where people look first.
      return { ...state, links: [action.link, ...state.links] }
    case "update-link":
      return {
        ...state,
        links: state.links.map((link) => (link.id === action.id ? { ...link, ...action.patch } : link)),
      }
    case "remove-link":
      return { ...state, links: state.links.filter((link) => link.id !== action.id) }
    case "restore-link": {
      if (state.links.some((link) => link.id === action.link.id)) return state
      const links = [...state.links]
      links.splice(Math.min(action.index, links.length), 0, action.link)
      return { ...state, links }
    }
    case "reorder": {
      const byId = new Map(state.links.map((link) => [link.id, link]))
      return { ...state, links: action.ids.map((id) => byId.get(id)!).filter(Boolean) }
    }
    case "reset":
      return action.state
  }
}
