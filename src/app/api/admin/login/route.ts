import { NextResponse } from "next/server"
import { signAdminToken } from "@/lib/admin-auth"

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json()

    if (
      !process.env.ADMIN_LOGIN ||
      !process.env.ADMIN_PASSWORD ||
      login.trim() !== process.env.ADMIN_LOGIN.trim() ||
      password.trim() !== process.env.ADMIN_PASSWORD.trim()
    ) {
      return NextResponse.json({ error: "Невірний логін або пароль" }, { status: 401 })
    }

    const token = await signAdminToken()

    const res = NextResponse.json({ success: true })
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })
    return res
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
