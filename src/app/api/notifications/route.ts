import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, ...NO_CACHE })

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unread") === "1"

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: unreadOnly ? 100 : 50,
    })

    return NextResponse.json(notifications, NO_CACHE)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, ...NO_CACHE })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, ...NO_CACHE })

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    })

    return NextResponse.json({ success: true }, NO_CACHE)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, ...NO_CACHE })
  }
}
