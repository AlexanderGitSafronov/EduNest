import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, published: true, isPublic: true },
      include: {
        teacher: { select: { id: true, name: true, image: true, bio: true } },
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              select: { id: true, title: true, type: true, duration: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(course)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
