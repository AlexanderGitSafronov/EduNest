import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { completed, watchedSecs } = await req.json()

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      create: {
        userId: session.user.id,
        lessonId,
        completed: completed ?? false,
        watchedSecs: watchedSecs ?? 0,
      },
      update: {
        completed: completed ?? undefined,
        watchedSecs: watchedSecs ?? undefined,
      },
    })

    return NextResponse.json(progress)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
