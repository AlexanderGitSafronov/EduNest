import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const moduleSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  courseId: z.string(),
  position: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, courseId, position } = moduleSchema.parse(body)

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const count = await prisma.module.count({ where: { courseId } })

    const module = await prisma.module.create({
      data: { title, description, courseId, position: position ?? count },
    })

    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
