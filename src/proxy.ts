import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { jwtVerify } from "jose"

const adminSecret = () =>
  new TextEncoder().encode(`admin:${process.env.NEXTAUTH_SECRET ?? ""}`)

async function verifyAdminCookie(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value
  if (!token) return false
  try {
    await jwtVerify(token, adminSecret())
    return true
  } catch {
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (await verifyAdminCookie(req)) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.next()
    }
    if (!(await verifyAdminCookie(req))) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    return NextResponse.next()
  }

  // User auth protection
  const protectedPaths = ["/dashboard", "/lessons", "/profile", "/notifications"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  const secureCookie = process.env.NODE_ENV === "production"
  const cookieName = secureCookie ? "__Secure-authjs.session-token" : "authjs.session-token"

  let token = null
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie,
      cookieName,
      salt: cookieName,
    })
  } catch {
    // treat as unauthenticated
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const res = NextResponse.next()
  res.headers.delete("x-powered-by")
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|icons|sw.js|manifest.json|api).*)"],
}
