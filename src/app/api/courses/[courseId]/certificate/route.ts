import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!

  const cert = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      course: { select: { title: true } },
      user: { select: { name: true } },
    },
  })

  return NextResponse.json(cert ?? null)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!

  // Verify course is 100% complete
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      enrollments: { where: { userId }, select: { id: true } },
    },
  })

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!course.enrollments.length) return NextResponse.json({ error: "Not enrolled" }, { status: 403 })

  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  if (allLessonIds.length === 0) return NextResponse.json({ error: "No lessons" }, { status: 400 })

  const completedCount = await prisma.lessonProgress.count({
    where: { userId, lessonId: { in: allLessonIds }, completed: true },
  })

  if (completedCount < allLessonIds.length) {
    return NextResponse.json({ error: "Course not complete" }, { status: 400 })
  }

  const cert = await prisma.certificate.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { id: `cert_${userId}_${courseId}`.slice(0, 36), userId, courseId },
    update: {},
    include: {
      course: { select: { title: true } },
      user: { select: { name: true } },
    },
  })

  // Award achievement if first course completed
  const completedCourses = await prisma.certificate.count({ where: { userId } })
  if (completedCourses === 1) {
    const ach = await prisma.achievement.findUnique({ where: { key: "first_course" } })
    if (ach) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ach.id } },
        create: { id: `ua_${userId}_${ach.id}`.slice(0, 36), userId, achievementId: ach.id },
        update: {},
      })
    }
  }

  return NextResponse.json(cert, { status: 201 })
}
