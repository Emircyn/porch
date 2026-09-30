import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { requestOrigin } from "@/lib/request-origin"

// OAuth (GitHub) and e-mail confirmation links land here with a one-time code.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = requestOrigin(request)
  const code = searchParams.get("code")
  const nextParam = searchParams.get("next") ?? "/dashboard"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=link`)
}
