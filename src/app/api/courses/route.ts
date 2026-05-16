import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { slugify } from "@/lib/utils"

const courseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if ((session.user as { role?: string }).role === "TEACHER") {
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: { select: { enrollments: true, modules: true } },
          modules: {
            include: { _count: { select: { lessons: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json(courses)
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true, image: true } },
            _count: { select: { modules: true } },
            modules: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(enrollments.map((e) => e.course))
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, thumbnail } = courseSchema.parse(body)

    let slug = slugify(title)
    const existing = await prisma.course.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const course = await prisma.course.create({
      data: { title, description, thumbnail, slug, teacherId: session.user.id },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
