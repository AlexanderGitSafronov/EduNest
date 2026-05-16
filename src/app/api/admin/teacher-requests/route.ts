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

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requests = await prisma.teacherRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(requests)
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, action, message } = await req.json()
  if (!id || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const request = await prisma.teacherRequest.findUnique({
    where: { id },
    include: { user: true },
  })
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (action === "approve") {
    await prisma.$transaction([
      prisma.teacherRequest.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { role: "TEACHER" },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          title: "Заявку схвалено",
          message: "Вітаємо! Тепер ви викладач. Перейдіть у Студію щоб створити перший курс.",
          type: "success",
        },
      }),
    ])
  } else {
    await prisma.$transaction([
      prisma.teacherRequest.update({
        where: { id },
        data: { status: "REJECTED", message: message ?? null },
      }),
      prisma.notification.create({
        data: {
          userId: request.userId,
          title: "Заявку відхилено",
          message: message ?? "На жаль, вашу заявку на отримання ролі викладача відхилено.",
          type: "error",
        },
      }),
    ])
  }

  return NextResponse.json({ success: true })
}
