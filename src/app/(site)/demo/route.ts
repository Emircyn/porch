import { NextResponse, type NextRequest } from "next/server"

import { requestOrigin } from "@/lib/request-origin"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@example.com"

// One click into the demo account: mint a one-time sign-in link on the server and use it straight away.
// No password is involved, so nobody can lock the demo by changing one.
export async function GET(request: NextRequest) {
  const origin = requestOrigin(request)
  const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email: DEMO_EMAIL })
  if (error || !data.properties?.hashed_token) {
    return NextResponse.redirect(`${origin}/login?error=demo`)
  }

  const supabase = await createClient()
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: data.properties.hashed_token,
  })
  if (verifyError) return NextResponse.redirect(`${origin}/login?error=demo`)
  return NextResponse.redirect(`${origin}/dashboard`)
}
