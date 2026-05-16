import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextAuthRequest } from "next-auth"

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Auth required routes
  const protectedPaths = ["/dashboard", "/lessons", "/profile", "/notifications"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !session?.user) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (
    session?.user &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const res = NextResponse.next()
  res.headers.delete("x-powered-by")
  return res
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|icons|sw.js|manifest.json).*)"],
}
