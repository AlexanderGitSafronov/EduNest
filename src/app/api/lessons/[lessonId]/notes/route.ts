import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const note = await prisma.note.findFirst({ where: { userId, lessonId } })
  return NextResponse.json(note ?? null)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { content } = await req.json()

  const existing = await prisma.note.findFirst({ where: { userId, lessonId } })

  const note = existing
    ? await prisma.note.update({ where: { id: existing.id }, data: { content } })
    : await prisma.note.create({ data: { content, userId, lessonId } })

  return NextResponse.json(note)
}
