import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  published: z.boolean().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { id: true, name: true, image: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if ((session.user as { role?: string }).role === "STUDENT") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId } },
      })
      if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 })
    }

    return NextResponse.json(course)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.course.update({ where: { id: courseId }, data })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
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

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.course.delete({ where: { id: courseId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
