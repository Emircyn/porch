import { z } from "zod"

// Keep in sync with public.is_reserved_username() in supabase/migrations.
const reserved = new Set([
  "about", "account", "admin", "api", "app", "auth", "billing", "blog", "dashboard", "demo", "editor", "help",
  "home", "login", "logout", "onboarding", "porch", "pricing", "privacy", "r", "settings", "signin", "signup",
  "static", "support", "terms", "www", "_next",
])

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters.")
  .max(30, "Use 30 characters or fewer.")
  .regex(/^[a-z0-9_.]+$/, "Use only letters, numbers, dots and underscores.")
  .refine((name) => !reserved.has(name), "That name is reserved. Try another.")
