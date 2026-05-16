import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.teacherRequest.findUnique({ where: { userId } })

    if (existing?.status === "PENDING") {
      return NextResponse.json({ status: "PENDING" })
    }

    await prisma.teacherRequest.upsert({
      where: { userId },
      create: { userId },
      update: { status: "PENDING", message: null },
    })

    return NextResponse.json({ status: "PENDING" })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
