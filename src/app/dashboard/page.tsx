import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { DashboardContent } from "@/components/dashboard/DashboardContent"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const role = (session.user as { role?: string }).role ?? "STUDENT"

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <DashboardContent role={role} />
      </main>
    </div>
  )
}
