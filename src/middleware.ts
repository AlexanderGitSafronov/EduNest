import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Auth required routes
  const protectedPaths = ["/dashboard", "/lessons", "/profile", "/notifications"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const res = NextResponse.next()
  res.headers.delete("x-powered-by")
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|icons|sw.js|manifest.json|api).*)"],
}
