"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** After checkout, Stripe's webhook can land a moment after the redirect; re-check a few times. */
export function RefreshUntilPro() {
  const router = useRouter()
  useEffect(() => {
    let tries = 0
    const timer = setInterval(() => {
      tries += 1
      router.refresh()
      if (tries >= 10) clearInterval(timer)
    }, 2000)
    return () => clearInterval(timer)
  }, [router])
  return null
}
