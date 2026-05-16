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
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { studentEmail } = await req.json()

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
