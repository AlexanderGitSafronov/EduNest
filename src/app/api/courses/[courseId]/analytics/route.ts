import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teacherId = (session.user as { id?: string }).id!

  const course = await prisma.course.findUnique({
    where: { id: courseId, teacherId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, type: true, duration: true },
          },
        },
      },
      enrollments: { select: { userId: true } },
    },
  })

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const totalStudents = course.enrollments.length
  if (totalStudents === 0) {
    return NextResponse.json({ lessons: [], totalStudents: 0, completionRate: 0 })
  }

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const studentIds = course.enrollments.map((e) => e.userId)

  const allProgress = await prisma.lessonProgress.findMany({
    where: {
      lessonId: { in: allLessons.map((l) => l.id) },
      userId: { in: studentIds },
    },
    select: { lessonId: true, completed: true, watchedSecs: true },
  })

  // Group by lessonId
  const progressByLesson = new Map<string, { completed: number; totalWatchedSecs: number; started: number }>()
  for (const p of allProgress) {
    const cur = progressByLesson.get(p.lessonId) ?? { completed: 0, totalWatchedSecs: 0, started: 0 }
    if (p.completed) cur.completed++
    if (p.watchedSecs > 0 || p.completed) cur.started++
    cur.totalWatchedSecs += p.watchedSecs
    progressByLesson.set(p.lessonId, cur)
  }

  const lessons = allLessons.map((lesson, i) => {
    const prog = progressByLesson.get(lesson.id) ?? { completed: 0, totalWatchedSecs: 0, started: 0 }
    const completionRate = totalStudents > 0 ? Math.round((prog.completed / totalStudents) * 100) : 0
    const dropOffRate = i === 0
      ? 0
      : Math.max(0, (progressByLesson.get(allLessons[i - 1].id)?.completed ?? 0) - prog.completed)
    const avgWatchedMins = prog.started > 0
      ? Math.round(prog.totalWatchedSecs / prog.started / 60 * 10) / 10
      : 0

    return {
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      position: i + 1,
      completionRate,
      completedCount: prog.completed,
      startedCount: prog.started,
      dropOff: dropOffRate,
      avgWatchedMins,
      expectedDurationMins: lesson.duration ? Math.round(lesson.duration / 60) : null,
    }
  })

  const completedAll = allLessons.length > 0
    ? await prisma.lessonProgress.groupBy({
        by: ["userId"],
        where: {
          lessonId: { in: allLessons.map((l) => l.id) },
          userId: { in: studentIds },
          completed: true,
        },
        having: { userId: { _count: { equals: allLessons.length } } },
      })
    : []

  return NextResponse.json({
    lessons,
    totalStudents,
    completionRate: totalStudents > 0 ? Math.round((completedAll.length / totalStudents) * 100) : 0,
    completedCount: completedAll.length,
  })
}
