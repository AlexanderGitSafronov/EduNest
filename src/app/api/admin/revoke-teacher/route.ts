import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function isAdmin() {
  const store = await cookies()
  const token = store.get("admin_token")?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { role: "STUDENT" },
    }),
    prisma.teacherRequest.updateMany({
      where: { userId },
      data: { status: "REVOKED" },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "Доступ викладача відкликано",
        message: "Адміністратор відкликав ваш доступ до ролі викладача. Зверніться за деталями.",
        type: "error",
      },
    }),
  ])

  return NextResponse.json({ success: true })
}
