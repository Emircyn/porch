import * as z from "zod/mini"

// Keep in sync with public.is_reserved_username() in supabase/migrations.
const reserved = new Set([
  "about", "account", "admin", "api", "app", "auth", "billing", "blog", "dashboard", "demo", "editor", "help",
  "home", "login", "logout", "onboarding", "porch", "pricing", "privacy", "r", "settings", "signin", "signup",
  "static", "support", "terms", "www", "_next",
])

// zod/mini keeps this tiny in client bundles (the full zod pulls in every locale).
export const usernameSchema = z.string().check(
  z.trim(),
  z.toLowerCase(),
  z.minLength(3, "Use at least 3 characters."),
  z.maxLength(30, "Use 30 characters or fewer."),
  z.regex(/^[a-z0-9_.]+$/, "Use only letters, numbers, dots and underscores."),
  z.refine((name) => !reserved.has(name), "That name is reserved. Try another.")
)
