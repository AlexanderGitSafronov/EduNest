import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Self-enrollment for public courses
    if (body.selfEnroll) {
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (!course || !course.published || !course.isPublic) {
        return NextResponse.json({ error: "Course not available" }, { status: 404 })
      }
      const userId = (session.user as { id?: string }).id!
      const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })
      if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 })

      const [enrollment] = await prisma.$transaction([
        prisma.enrollment.create({ data: { userId, courseId } }),
        prisma.notification.create({
          data: {
            userId: course.teacherId,
            title: "Новий студент",
            message: `${session.user.name ?? session.user.email} записався на курс «${course.title}»`,
            type: "info",
            link: `/dashboard/courses/${courseId}`,
          },
        }),
      ])
      return NextResponse.json(enrollment, { status: 201 })
    }

    if ((session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentEmail } = body

    const student = await prisma.user.findUnique({
      where: { email: studentEmail, role: "STUDENT" },
    })
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    })
    if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 })

    const enrollment = await prisma.enrollment.create({
      data: { userId: student.id, courseId },
    })

    await prisma.notification.create({
      data: {
        userId: student.id,
        title: "Доступ надано",
        message: `Вам надано доступ до курсу "${course.title}"`,
        type: "access",
        link: `/courses/${course.id}`,
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentId } = await req.json()

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.enrollment.delete({
      where: { userId_courseId: { userId: studentId, courseId } },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
