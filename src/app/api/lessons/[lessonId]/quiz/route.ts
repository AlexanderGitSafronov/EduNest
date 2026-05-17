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

  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId },
    include: { options: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  })

  return NextResponse.json(questions)
}

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

    const { questions } = await req.json()

    await prisma.quizQuestion.deleteMany({ where: { lessonId } })

    const created = await Promise.all(
      questions.map(async (q: { question: string; options: Array<{ text: string; isCorrect: boolean }> }, i: number) => {
        const qId = `qq_${lessonId}_${i}`.slice(0, 36)
        return prisma.quizQuestion.create({
          data: {
            id: qId,
            lessonId,
            question: q.question,
            position: i,
            options: {
              create: q.options.map((o, j) => ({
                id: `qo_${qId}_${j}`.slice(0, 36),
                text: o.text,
                isCorrect: o.isCorrect,
                position: j,
              })),
            },
          },
          include: { options: true },
        })
      })
    )

    return NextResponse.json(created)
  } catch (error) {
    console.error("PUT /api/lessons/[lessonId]/quiz error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
