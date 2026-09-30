import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Classic (edge) middleware on purpose: OpenNext on Workers does not support Node middleware (`proxy.ts`) yet.
// It only runs on app routes, so public pages at /<username> stay cacheable and cost no auth work.

const authPages = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSession(request)
  const { pathname } = request.nextUrl

  const redirect = (to: string) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ""
    if (to === "/login") url.searchParams.set("next", pathname)
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  if (!userId && (pathname.startsWith("/dashboard") || pathname === "/onboarding")) {
    return redirect("/login")
  }
  if (userId && authPages.includes(pathname)) {
    return redirect("/dashboard")
  }
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup", "/auth/:path*"],
}
