import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params
  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      teacher: { select: { id: true, name: true, image: true } },
      trackCourses: {
        orderBy: { position: "asc" },
        include: {
          course: {
            include: {
              modules: { include: { lessons: { select: { id: true } } } },
              _count: { select: { enrollments: true } },
            },
          },
        },
      },
    },
  })
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(track)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teacherId = (session.user as { id?: string }).id!
  const track = await prisma.track.findUnique({ where: { id: trackId } })
  if (!track || track.teacherId !== teacherId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { title, description, isPublic, courseIds } = await req.json()

  if (courseIds !== undefined) {
    await prisma.trackCourse.deleteMany({ where: { trackId } })
    await prisma.trackCourse.createMany({
      data: (courseIds as string[]).map((courseId, i) => ({
        id: `tc_${trackId}_${i}`,
        trackId,
        courseId,
        position: i,
      })),
    })
  }

  const updated = await prisma.track.update({
    where: { id: trackId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
    },
    include: {
      trackCourses: {
        orderBy: { position: "asc" },
        include: { course: { select: { id: true, title: true, thumbnail: true } } },
      },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  const { trackId } = await params
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const teacherId = (session.user as { id?: string }).id!
  const track = await prisma.track.findUnique({ where: { id: trackId } })
  if (!track || track.teacherId !== teacherId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.track.delete({ where: { id: trackId } })
  return NextResponse.json({ success: true })
}
