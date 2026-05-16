import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const role = (session.user as { role?: string }).role

  if (role === "TEACHER") {
    const tracks = await prisma.track.findMany({
      where: { teacherId: userId },
      include: {
        trackCourses: {
          orderBy: { position: "asc" },
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true, _count: { select: { enrollments: true } } },
            },
          },
        },
        _count: { select: { trackCourses: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(tracks)
  }

  // Students: public tracks
  const tracks = await prisma.track.findMany({
    where: { isPublic: true },
    include: {
      teacher: { select: { id: true, name: true, image: true } },
      trackCourses: {
        orderBy: { position: "asc" },
        include: {
          course: {
            select: { id: true, title: true, thumbnail: true, description: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(tracks)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teacherId = (session.user as { id?: string }).id!
  const { title, description, courseIds } = await req.json()

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 })

  const track = await prisma.track.create({
    data: {
      id: `track_${Date.now()}`,
      title: title.trim(),
      description: description?.trim() ?? null,
      teacherId,
      trackCourses: {
        create: (courseIds ?? []).map((courseId: string, i: number) => ({
          id: `tc_${Date.now()}_${i}`,
          courseId,
          position: i,
        })),
      },
    },
    include: {
      trackCourses: {
        include: { course: { select: { id: true, title: true, thumbnail: true } } },
        orderBy: { position: "asc" },
      },
    },
  })

  return NextResponse.json(track, { status: 201 })
}
