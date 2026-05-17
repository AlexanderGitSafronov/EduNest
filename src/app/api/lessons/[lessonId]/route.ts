import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = (session.user as { id?: string }).id!
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: { select: { teacherId: true } } } } },
    })

    if (!lesson || lesson.module.course.teacherId !== teacherId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (body.title !== undefined) data.title = body.title
    if (body.unlockAfterDays !== undefined) data.unlockAfterDays = body.unlockAfterDays === "" ? null : Number(body.unlockAfterDays)
    if (body.published !== undefined) data.published = body.published
    if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl
    if (body.content !== undefined) data.content = body.content
    if (body.type !== undefined) data.type = body.type

    const updated = await prisma.lesson.update({ where: { id: lessonId }, data })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/lessons/[lessonId] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
