import "server-only"

import { createClient } from "@supabase/supabase-js"

import { supabaseUrl } from "./env"
import type { Database } from "./types"

/** Bypasses RLS. Only for the Stripe webhook and scripts; never for anything a user controls. */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set")

  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
