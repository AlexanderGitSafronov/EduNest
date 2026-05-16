import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard"
import { StudentDashboard } from "@/components/student/StudentDashboard"
import { Navbar } from "@/components/layout/Navbar"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        {(session.user as { role?: string }).role === "TEACHER" ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  )
}
