import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json(null)

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json(null)

  const request = await prisma.teacherRequest.findUnique({
    where: { userId },
    select: { id: true, status: true, message: true, createdAt: true },
  })

  return NextResponse.json(request)
}
