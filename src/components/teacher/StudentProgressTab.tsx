"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Clock, TrendingUp, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Lesson { id: string; title: string; type: string }
interface Module { id: string; title: string; lessons: Lesson[] }
interface StudentProgress {
  id: string
  name: string | null
  email: string
  image: string | null
  enrolledAt: string
  completedLessons: number
  totalLessons: number
  progressPct: number
  lastActivity: string | null
  lessonProgress: Array<{ lessonId: string; completed: boolean; watchedSecs: number }>
}
interface ProgressData {
  students: StudentProgress[]
  totalLessons: number
  modules: Module[]
}

function statusInfo(pct: number) {
  if (pct === 100) return { label: "Завершено", color: "text-green-500", bg: "bg-green-500/10", badge: "success" as const }
  if (pct > 0) return { label: "В процесі", color: "text-blue-500", bg: "bg-blue-500/10", badge: "secondary" as const }
  return { label: "Не почав", color: "text-muted-foreground", bg: "bg-muted", badge: "secondary" as const }
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Сьогодні"
  if (days === 1) return "Вчора"
  if (days < 7) return `${days} дн. тому`
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })
}

function StudentRow({ student, modules }: { student: StudentProgress; modules: Module[] }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusInfo(student.progressPct)
  const completedIds = new Set(student.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId))

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={student.image ?? ""} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
            {student.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm truncate">{student.name ?? "Без імені"}</p>
            <Badge variant={status.badge} className="text-xs shrink-0">{status.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mb-2">{student.email}</p>
          <div className="flex items-center gap-3">
            <Progress value={student.progressPct} className="h-1.5 flex-1" />
            <span className="text-xs font-medium tabular-nums shrink-0 w-10 text-right">
              {student.completedLessons}/{student.totalLessons}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">Активність</span>
            <span className={cn("text-xs font-medium", student.lastActivity ? "text-foreground" : "text-muted-foreground")}>
              {formatDate(student.lastActivity)}
            </span>
          </div>
          <div className={cn("p-2 rounded-lg", status.bg)}>
            <TrendingUp className={cn("h-4 w-4", status.color)} />
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t bg-muted/20"
          >
            <div className="p-4 space-y-4">
              {modules.map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{mod.title}</p>
                  <div className="space-y-1.5">
                    {mod.lessons.map((lesson) => {
                      const done = completedIds.has(lesson.id)
                      const watched = student.lessonProgress.find((p) => p.lessonId === lesson.id)?.watchedSecs ?? 0
                      return (
                        <div key={lesson.id} className="flex items-center gap-2.5 py-1">
                          {done
                            ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            : watched > 0
                            ? <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                            : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          }
                          <span className={cn("text-sm truncate", done ? "text-foreground" : "text-muted-foreground")}>
                            {lesson.title}
                          </span>
                          {!done && watched > 0 && (
                            <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                              {Math.floor(watched / 60)}хв
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StudentProgressTab({ courseId }: { courseId: string }) {
  const [filter, setFilter] = useState<"all" | "done" | "inprogress" | "notstarted">("all")

  const { data, isLoading, isError, refetch } = useQuery<ProgressData>({
    queryKey: ["student-progress", courseId],
    queryFn: () => fetch(`/api/courses/${courseId}/student-progress`).then((r) => r.json()),
  })

  if (isLoading) return (
    <div className="space-y-3 mt-2">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
  )

  if (isError || !data) return (
    <Card className="border-destructive/20 mt-2">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive/50 mb-3" />
        <p className="font-medium mb-4">Не вдалося завантажити прогрес</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Спробувати знову
        </Button>
      </CardContent>
    </Card>
  )

  const { students, modules } = data

  const filtered = students.filter((s) => {
    if (filter === "done") return s.progressPct === 100
    if (filter === "inprogress") return s.progressPct > 0 && s.progressPct < 100
    if (filter === "notstarted") return s.progressPct === 0
    return true
  })

  const doneCount = students.filter((s) => s.progressPct === 100).length
  const inProgressCount = students.filter((s) => s.progressPct > 0 && s.progressPct < 100).length
  const notStartedCount = students.filter((s) => s.progressPct === 0).length
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.progressPct, 0) / students.length)
    : 0

  if (students.length === 0) return (
    <Card className="border-dashed mt-2">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="font-medium mb-1">Немає студентів</p>
        <p className="text-sm text-muted-foreground">Додайте студентів у вкладці Студенти</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-5 mt-2">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Всього", value: students.length, color: "text-foreground", active: filter === "all", key: "all" as const },
          { label: "Завершили", value: doneCount, color: "text-green-500", active: filter === "done", key: "done" as const },
          { label: "В процесі", value: inProgressCount, color: "text-blue-500", active: filter === "inprogress", key: "inprogress" as const },
          { label: "Не почали", value: notStartedCount, color: "text-orange-500", active: filter === "notstarted", key: "notstarted" as const },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              stat.active ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40 hover:bg-muted/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Average progress */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-sm text-muted-foreground shrink-0">Середній прогрес</span>
        <Progress value={avgProgress} className="h-2 flex-1" />
        <span className="text-sm font-semibold tabular-nums shrink-0">{avgProgress}%</span>
      </div>

      {/* Students list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Немає студентів у цій категорії</p>
        ) : (
          filtered
            .sort((a, b) => b.progressPct - a.progressPct)
            .map((student, i) => (
              <motion.div key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <StudentRow student={student} modules={modules} />
              </motion.div>
            ))
        )}
      </div>
    </div>
  )
}
