import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default async function AdminPage() {
  const store = await cookies()
  const token = store.get("admin_token")?.value
  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login")
  }

  const [requests, teachers] = await Promise.all([
    prisma.teacherRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true, name: true, email: true, image: true, createdAt: true,
        _count: { select: { courses: true, enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return <AdminDashboard requests={requests} teachers={teachers} />
}
