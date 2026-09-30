// Row shortcuts over the generated types. Regenerate with `npm run db:types` after every migration.
import type { Database, Tables } from "./database.types"

export type { Database }
export type ProfileRow = Tables<"profiles">
export type LinkRow = Tables<"links">
export type Plan = "free" | "pro"
