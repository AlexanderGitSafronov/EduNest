import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const lessonSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  type: z.enum(["VIDEO", "TEXT", "MIXED", "QUIZ"]).default("TEXT"),
  moduleId: z.string(),
  position: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = lessonSchema.parse(body)

    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
      include: { course: true },
    })
    if (!module || module.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const count = await prisma.lesson.count({ where: { moduleId: data.moduleId } })

    const lesson = await prisma.lesson.create({
      data: { ...data, position: data.position ?? count },
    })

    await prisma.notification.createMany({
      data: (
        await prisma.enrollment.findMany({
          where: { courseId: module.courseId },
          select: { userId: true },
        })
      ).map((e) => ({
        userId: e.userId,
        title: "Новий урок",
        message: `Додано новий урок: "${lesson.title}"`,
        type: "lesson",
        link: `/lessons/${lesson.id}`,
      })),
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
