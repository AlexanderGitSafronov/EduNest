import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!

  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { key: "asc" } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
  ])

  const earnedKeys = new Set(userAchievements.map((ua) => ua.achievement.key))

  return NextResponse.json({
    achievements: allAchievements.map((a) => ({
      ...a,
      earned: earnedKeys.has(a.key),
      earnedAt: userAchievements.find((ua) => ua.achievement.key === a.key)?.earnedAt ?? null,
    })),
    earnedCount: earnedKeys.size,
    totalCount: allAchievements.length,
  })
}

// Called after significant events to check and award achievements
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id?: string }).id!
  const { event } = await req.json()

  const newAchievements: string[] = []

  async function award(key: string) {
    const ach = await prisma.achievement.findUnique({ where: { key } })
    if (!ach) return
    try {
      await prisma.userAchievement.create({
        data: { id: `ua_${userId}_${ach.id}`.slice(0, 36), userId, achievementId: ach.id },
      })
      newAchievements.push(ach.title)
    } catch { /* already earned */ }
  }

  if (event === "lesson_completed") {
    const completedCount = await prisma.lessonProgress.count({ where: { userId, completed: true } })
    if (completedCount === 1) await award("first_lesson")
    if (completedCount >= 10) await award("lessons_10")
    if (completedCount >= 50) await award("lessons_50")
  }

  if (event === "enrolled") {
    const enrollCount = await prisma.enrollment.count({ where: { userId } })
    if (enrollCount >= 3) await award("courses_3")
  }

  if (event === "commented") {
    await award("first_comment")
  }

  return NextResponse.json({ newAchievements })
}
