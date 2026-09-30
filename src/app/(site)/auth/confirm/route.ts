import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { requestOrigin } from "@/lib/request-origin"

// For e-mail templates that link with a token hash ({{ .TokenHash }}); works across browsers, unlike ?code=.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = requestOrigin(request)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}/dashboard`)
  }
  return NextResponse.redirect(`${origin}/login?error=link`)
}
