import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const NO_CACHE = { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true, isPublic: true },
      include: {
        teacher: { select: { name: true, image: true } },
        _count: { select: { enrollments: true, modules: true } },
        modules: {
          include: { _count: { select: { lessons: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(courses, NO_CACHE)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500, ...NO_CACHE })
  }
}
