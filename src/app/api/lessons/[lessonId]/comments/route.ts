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

  const comments = await prisma.comment.findMany({
    where: { lessonId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(comments)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { content, parentId } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Empty content" }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { content: content.trim(), userId, lessonId, parentId: parentId ?? null },
    include: { user: { select: { id: true, name: true, image: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}

export async function DELETE(
  req: Request,
  _ctx: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { commentId } = await req.json()

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id: commentId } })
  return NextResponse.json({ success: true })
}
