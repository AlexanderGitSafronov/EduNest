import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!

  const allProgress = await prisma.lessonProgress.findMany({
    where: { userId, completed: true },
    select: { updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  const uniqueDays = new Set(
    allProgress.map((p) => p.updatedAt.toISOString().slice(0, 10))
  )

  const sortedDays = Array.from(uniqueDays).sort().reverse()

  let streak = 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  if (sortedDays[0] !== today && sortedDays[0] !== yesterday) {
    return NextResponse.json({ streak: 0, totalDays: sortedDays.length })
  }

  let current = sortedDays[0] === today ? today : yesterday
  for (const day of sortedDays) {
    if (day === current) {
      streak++
      const d = new Date(current)
      d.setDate(d.getDate() - 1)
      current = d.toISOString().slice(0, 10)
    } else {
      break
    }
  }

  return NextResponse.json({ streak, totalDays: sortedDays.length })
}
