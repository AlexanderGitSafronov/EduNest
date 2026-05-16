import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, ...NO_CACHE })

    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonId: true, completed: true, watchedSecs: true },
    })

    return NextResponse.json(progress, NO_CACHE)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, ...NO_CACHE })
  }
}
