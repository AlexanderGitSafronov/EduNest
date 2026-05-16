import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, teacherId: (session.user as { id?: string }).id },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              select: { id: true, title: true, type: true },
            },
          },
        },
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const allLessons = course.modules.flatMap((m) => m.lessons)
    const totalLessons = allLessons.length

    const studentIds = course.enrollments.map((e) => e.user.id)

    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        lessonId: { in: allLessons.map((l) => l.id) },
        userId: { in: studentIds },
      },
      select: { userId: true, lessonId: true, completed: true, watchedSecs: true, updatedAt: true },
    })

    const students = course.enrollments.map((enrollment) => {
      const userProgress = allProgress.filter((p) => p.userId === enrollment.user.id)
      const completedLessons = userProgress.filter((p) => p.completed).length
      const lastActivity = userProgress.length > 0
        ? userProgress.reduce((latest, p) =>
            new Date(p.updatedAt) > new Date(latest) ? p.updatedAt.toISOString() : latest,
            userProgress[0].updatedAt.toISOString()
          )
        : null

      return {
        ...enrollment.user,
        enrolledAt: enrollment.createdAt,
        completedLessons,
        totalLessons,
        progressPct: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        lastActivity,
        lessonProgress: userProgress.map((p) => ({
          lessonId: p.lessonId,
          completed: p.completed,
          watchedSecs: p.watchedSecs,
        })),
      }
    })

    return NextResponse.json({
      students,
      totalLessons,
      modules: course.modules,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
