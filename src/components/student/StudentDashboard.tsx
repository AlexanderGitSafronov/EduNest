"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, CheckCircle2, TrendingUp, Play, ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"

interface EnrolledCourse {
  id: string
  title: string
  description?: string
  thumbnail?: string
  teacher: { name: string; image?: string }
  modules: Array<{ lessons: Array<{ id: string }> }>
  _count: { modules: number }
}

async function fetchEnrolledCourses(): Promise<EnrolledCourse[]> {
  const res = await fetch("/api/courses", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`)
  return res.json()
}

async function fetchProgress(): Promise<Array<{ lessonId: string; completed: boolean }>> {
  const res = await fetch("/api/progress", { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export function StudentDashboard() {
  const { data: session } = useSession()
  const { t } = useTranslation()

  const { data: courses, isLoading, isError, refetch } = useQuery({ queryKey: ["enrolled-courses"], queryFn: fetchEnrolledCourses })
  const { data: progress } = useQuery({ queryKey: ["progress"], queryFn: fetchProgress })

  const completedLessonIds = new Set(progress?.filter(p => p.completed).map(p => p.lessonId) ?? [])

  const getCourseProgress = (course: EnrolledCourse) => {
    const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0)
    if (totalLessons === 0) return 0
    const completed = course.modules.reduce(
      (s, m) => s + m.lessons.filter(l => completedLessonIds.has(l.id)).length,
      0
    )
    return Math.round((completed / totalLessons) * 100)
  }

  const totalCompleted = courses?.reduce((sum, c) => sum + c.modules.reduce(
    (s, m) => s + m.lessons.filter(l => completedLessonIds.has(l.id)).length, 0
  ), 0) ?? 0
  const totalLessons = courses?.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0), 0) ?? 0

  const stats = [
    { label: t.dashboard.student.enrolled, value: courses?.length ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: t.dashboard.student.completed, value: totalCompleted, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Всього уроків", value: totalLessons, icon: Play, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: t.dashboard.student.progress, value: totalLessons > 0 ? `${Math.round((totalCompleted/totalLessons)*100)}%` : "0%", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold">{t.dashboard.student.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.dashboard.welcome}, {session?.user?.name?.split(" ")[0]}! 👋
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-xl font-semibold mb-4">{t.dashboard.student.enrolled}</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <Card className="border-destructive/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Не вдалося завантажити курси</h3>
            <p className="text-muted-foreground text-sm mb-6">Перевірте підключення та спробуйте ще раз</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Спробувати знову
            </Button>
          </CardContent>
        </Card>
      ) : courses?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t.dashboard.student.noCoursesYet}</h3>
            <p className="text-muted-foreground text-sm">Зверніться до вашого викладача для отримання доступу</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course, i) => {
            const progress = getCourseProgress(course)
            const totalLess = course.modules.reduce((s, m) => s + m.lessons.length, 0)
            const firstLesson = course.modules[0]?.lessons[0]

            return (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                <Card className="group hover:shadow-lg transition-all duration-300">
                  <div className="h-2 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-snug">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description || "Опис відсутній"}</CardDescription>
                    <p className="text-xs text-muted-foreground">Викладач: {course.teacher.name}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{t.dashboard.student.progress}</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{totalLess} уроків</p>
                    </div>
                    {progress === 100 ? (
                      <Badge variant="success" className="w-full justify-center py-1">✓ Завершено</Badge>
                    ) : (
                      <Button size="sm" variant="gradient" className="w-full group/btn" asChild>
                        <Link href={firstLesson ? `/lessons/${firstLesson.id}` : "#"}>
                          <Play className="mr-2 h-3.5 w-3.5" />
                          {progress > 0 ? t.dashboard.student.continue : "Почати"}
                          <ArrowRight className="ml-auto h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
