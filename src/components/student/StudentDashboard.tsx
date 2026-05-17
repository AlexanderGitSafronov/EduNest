"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, CheckCircle2, TrendingUp, Play, ArrowRight, RefreshCw, AlertCircle, Clapperboard, Loader2, Clock, XCircle, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTranslation } from "@/hooks/useTranslation"
import { toast } from "sonner"
import Link from "next/link"
import { StreakWidget } from "./StreakWidget"
import { AchievementsWidget } from "./AchievementsWidget"

interface EnrolledCourse {
  id: string
  title: string
  description?: string
  thumbnail?: string
  deadline?: string
  teacher: { name: string; image?: string }
  modules: Array<{ lessons: Array<{ id: string }> }>
  _count: { modules: number }
}

interface TeacherRequest {
  id: string
  status: string
  message: string | null
}

async function fetchEnrolledCourses(): Promise<EnrolledCourse[]> {
  const res = await fetch("/api/courses?view=student", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`)
  return res.json()
}

async function fetchProgress(): Promise<Array<{ lessonId: string; completed: boolean }>> {
  const res = await fetch("/api/progress", { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

async function fetchTeacherRequest(): Promise<TeacherRequest | null> {
  const res = await fetch("/api/user/teacher-request", { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

function BecomeTeacherCard() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: request, refetch } = useQuery({
    queryKey: ["teacher-request"],
    queryFn: fetchTeacherRequest,
    enabled: (session?.user as { role?: string })?.role === "STUDENT",
  })

  if ((session?.user as { role?: string })?.role !== "STUDENT") return null

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/become-teacher", { method: "POST" })
      if (!res.ok) throw new Error()
      await refetch()
      setOpen(false)
      toast.success("Заявку надіслано! Очікуйте підтвердження від адміністратора.")
    } catch {
      toast.error("Не вдалося надіслати заявку. Спробуйте ще раз.")
    } finally {
      setLoading(false)
    }
  }

  if (request?.status === "PENDING") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="flex items-center gap-4 py-5 px-6">
            <div className="p-3 rounded-xl bg-orange-500/10 shrink-0">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Заявку на викладача надіслано</p>
              <p className="text-xs text-muted-foreground mt-0.5">Очікуйте підтвердження від адміністратора</p>
            </div>
            <Badge variant="secondary" className="ml-auto shrink-0">На розгляді</Badge>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (request?.status === "REJECTED") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-5 px-6">
            <div className="p-3 rounded-xl bg-destructive/10 shrink-0">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Заявку відхилено</p>
              {request.message && <p className="text-xs text-muted-foreground mt-0.5">{request.message}</p>}
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => setOpen(true)}>
              Подати повторно
            </Button>
          </CardContent>
        </Card>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Подати заявку повторно?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground py-2">Нову заявку буде передано на розгляд адміністратору.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Скасувати</Button>
              <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Надсилання...</> : "Підтвердити"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Clapperboard className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-semibold">Хочете ділитися знаннями?</h3>
                <p className="text-sm text-muted-foreground">Станьте викладачем і створюйте власні курси</p>
              </div>
            </div>
            <Button variant="gradient" className="shrink-0 rounded-full px-6" onClick={() => setOpen(true)}>
              Стати викладачем
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-primary" />
              Стати викладачем
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ваша заявка буде надіслана адміністратору. Після підтвердження ви отримаєте доступ до Studio.
            </p>
            <ul className="text-sm space-y-1.5">
              {["Створюйте необмежену кількість курсів", "Керуйте студентами", "Переглядайте прогрес учнів"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Скасувати</Button>
            <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Надсилання...</> : "Надіслати заявку"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
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

  const streakSlot = <StreakWidget />

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t.dashboard.welcome},{" "}
          <span className="gradient-text">{session?.user?.name?.split(" ")[0] ?? "👋"}</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{t.dashboard.student.title} • Продовжуйте навчання</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <Card className="relative overflow-hidden border bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300 group">
                <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity -translate-y-12 translate-x-12`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2 tabular-nums">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bg} ring-1 ring-current/10 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {streakSlot}
        <AchievementsWidget />
      </div>

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
            <p className="text-muted-foreground text-sm mb-4">Зверніться до вашого викладача або знайдіть курс у каталозі</p>
            <Button variant="outline" asChild>
              <Link href="/courses">Переглянути каталог курсів</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course, i) => {
            const prog = getCourseProgress(course)
            const totalLess = course.modules.reduce((s, m) => s + m.lessons.length, 0)
            const firstLesson = course.modules[0]?.lessons[0]

            return (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}>
                <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border-border/60">
                  {/* Thumbnail / gradient header */}
                  <div className="relative h-36 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 relative">
                        <div
                          className="absolute inset-0 opacity-25"
                          style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                            backgroundSize: "20px 20px",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white/80" />
                        </div>
                      </div>
                    )}
                    {/* Progress chip overlay */}
                    <div className="absolute top-3 right-3">
                      {prog === 100 ? (
                        <Badge variant="success" className="bg-green-500/90 text-white border-0 backdrop-blur shadow-md">✓ Завершено</Badge>
                      ) : (
                        <Badge className="bg-black/40 text-white border-0 backdrop-blur shadow-md">{prog}%</Badge>
                      )}
                    </div>
                    {course.deadline && (() => {
                      const daysLeft = Math.ceil((new Date(course.deadline).getTime() - Date.now()) / 86400000)
                      if (daysLeft > 0 && daysLeft <= 7) return (
                        <div className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full backdrop-blur ${daysLeft <= 3 ? "bg-red-500/90 text-white" : "bg-orange-500/90 text-white"} shadow-md`}>
                          <CalendarClock className="h-3 w-3" />
                          {daysLeft === 1 ? "завтра" : `${daysLeft} дн.`}
                        </div>
                      )
                      return null
                    })()}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base leading-snug line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{course.description || "Опис відсутній"}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                        {course.teacher.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{course.teacher.name}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{totalLess} уроків</span>
                        <span className="font-medium tabular-nums">{prog}%</span>
                      </div>
                      <Progress value={prog} className="h-1.5" />
                    </div>
                    {prog === 100 ? (
                      <Button size="sm" variant="outline" className="w-full rounded-xl" asChild>
                        <Link href={firstLesson ? `/lessons/${firstLesson.id}` : "#"}>Переглянути</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="gradient" className="w-full group/btn rounded-xl shadow-md shadow-indigo-500/20" asChild>
                        <Link href={firstLesson ? `/lessons/${firstLesson.id}` : "#"}>
                          <Play className="mr-2 h-3.5 w-3.5" />
                          {prog > 0 ? t.dashboard.student.continue : "Почати"}
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

      <BecomeTeacherCard />
    </div>
  )
}
