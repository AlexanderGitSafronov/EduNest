import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const teacher = await prisma.user.findUnique({
      where: { id, role: "TEACHER" },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        createdAt: true,
        courses: {
          where: { published: true, isPublic: true },
          include: {
            _count: { select: { enrollments: true, modules: true } },
            modules: { include: { _count: { select: { lessons: true } } } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { courses: true } },
      },
    })

    if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(teacher)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
