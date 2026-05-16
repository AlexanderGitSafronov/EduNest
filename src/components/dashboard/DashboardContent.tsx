"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useViewModeStore } from "@/lib/store"
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard"
import { StudentDashboard } from "@/components/student/StudentDashboard"
import { Lock } from "lucide-react"

export function DashboardContent({ role }: { role: string }) {
  const { viewMode } = useViewModeStore()
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()

  const lockedLesson = searchParams.get("locked")
  const unlockDate = searchParams.get("unlockDate")

  useEffect(() => setMounted(true), [])

  const effectiveView = !mounted
    ? (role === "TEACHER" ? "teacher" : "student")
    : role === "TEACHER"
    ? (viewMode ?? "teacher")
    : "student"

  return (
    <>
      {lockedLesson && unlockDate && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm">
            <Lock className="h-4 w-4 text-orange-500 shrink-0" />
            <p>
              Урок <strong>«{lockedLesson}»</strong> буде доступний{" "}
              <strong>{new Date(unlockDate).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}</strong>
            </p>
          </div>
        </div>
      )}
      {effectiveView === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
    </>
  )
}
