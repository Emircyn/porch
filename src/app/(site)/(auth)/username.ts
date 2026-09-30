"use server"

import { createClient } from "@/lib/supabase/server"
import { usernameSchema } from "@/lib/usernames"

/** Is this page name free? Runs on the server so the browser doesn't need the Supabase client. */
export async function isUsernameAvailable(name: string): Promise<boolean | null> {
  const parsed = usernameSchema.safeParse(name)
  if (!parsed.success) return false
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("username_available", { name: parsed.data })
  return error ? null : Boolean(data)
}
