"use client"

import { useEffect, useState } from "react"

import { isUsernameAvailable } from "@/app/(site)/(auth)/username"
import { usernameSchema } from "@/lib/usernames"

type Availability = { name: string; status: "available" | "taken" } | null

/** Validates as you type, then asks the database (debounced) whether the name is free. */
export function useUsernameAvailability(raw: string) {
  const [result, setResult] = useState<Availability>(null)
  const parsed = usernameSchema.safeParse(raw)
  const name = parsed.success ? parsed.data : null

  useEffect(() => {
    if (!name) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const available = await isUsernameAvailable(name)
      if (!cancelled && available !== null) {
        setResult({ name, status: available ? "available" : "taken" })
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [name])

  if (!raw) return { status: "idle" as const }
  if (!parsed.success) return { status: "invalid" as const, message: parsed.error.issues[0].message }
  if (result?.name !== name) return { status: "checking" as const }
  return { status: result.status }
}
