import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id },
      select: { lessonId: true, completed: true, watchedSecs: true },
    })

    return NextResponse.json(progress)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
