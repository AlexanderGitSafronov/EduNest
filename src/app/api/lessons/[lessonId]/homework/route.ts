import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const role = (session.user as { role?: string }).role

  const homework = await prisma.homework.findUnique({
    where: { lessonId },
    include: {
      submissions: role === "TEACHER"
        ? {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
            orderBy: { createdAt: "desc" },
          }
        : { where: { userId }, select: { id: true, content: true, grade: true, feedback: true, createdAt: true } },
    },
  })

  return NextResponse.json(homework ?? null)
}

// Teacher creates/updates homework
export async function PUT(
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

    const { title, description } = await req.json()
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
    }

    const hw = await prisma.homework.upsert({
      where: { lessonId },
      create: { id: `hw_${lessonId}`.slice(0, 36), lessonId, title: title.trim(), description: description.trim() },
      update: { title: title.trim(), description: description.trim() },
    })

    return NextResponse.json(hw)
  } catch (error) {
    console.error("PUT /api/lessons/[lessonId]/homework error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Student submits homework
export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { content } = await req.json()

  const homework = await prisma.homework.findUnique({ where: { lessonId } })
  if (!homework) return NextResponse.json({ error: "No homework for this lesson" }, { status: 404 })

  const submission = await prisma.homeworkSubmission.upsert({
    where: { homeworkId_userId: { homeworkId: homework.id, userId } },
    create: { id: `hs_${homework.id}_${userId}`.slice(0, 36), homeworkId: homework.id, userId, content },
    update: { content },
  })

  return NextResponse.json(submission)
}

// Teacher grades submission
export async function PATCH(
  req: Request,
  _ctx: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherId = (session.user as { id?: string }).id!
    const { submissionId, grade, feedback } = await req.json()

    const sub = await prisma.homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: { homework: { include: { lesson: { include: { module: { include: { course: { select: { teacherId: true } } } } } } } } },
    })
    if (!sub || sub.homework.lesson.module.course.teacherId !== teacherId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const submission = await prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: { grade, feedback },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error("PATCH /api/lessons/[lessonId]/homework error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
