"use client"

import { useState, useEffect } from "react"
import { useViewModeStore } from "@/lib/store"
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard"
import { StudentDashboard } from "@/components/student/StudentDashboard"

export function DashboardContent({ role }: { role: string }) {
  const { viewMode } = useViewModeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const effectiveView = !mounted
    ? (role === "TEACHER" ? "teacher" : "student")
    : role === "TEACHER"
    ? (viewMode ?? "teacher")
    : "student"

  return effectiveView === "teacher" ? <TeacherDashboard /> : <StudentDashboard />
}
