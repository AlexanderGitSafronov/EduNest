"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BookOpen, Users, Play, ChevronDown, ChevronUp, ArrowLeft,
  CheckCircle2, Clock, Loader2, GraduationCap, Video, FileText, LayoutList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/layout/Navbar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Lesson { id: string; title: string; type: string; duration?: number }
interface Module { id: string; title: string; lessons: Lesson[] }
interface CourseDetail {
  id: string
  title: string
  description?: string
  thumbnail?: string
  teacher: { id: string; name: string; image?: string; bio?: string }
  modules: Module[]
  _count: { enrollments: number }
}

const typeIcon = (type: string) => {
  if (type === "VIDEO" || type === "MIXED") return <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
  if (type === "QUIZ") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
  return <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
}

function formatDuration(secs?: number) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  return m > 0 ? `${m} хв` : null
}

export default function CoursePreviewPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const router = useRouter()
  const { data: session } = useSession()
  const [enrolling, setEnrolling] = useState(false)
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set())

  const { data: course, isLoading, isError } = useQuery<CourseDetail>({
    queryKey: ["course-preview", courseId],
    queryFn: () => fetch(`/api/courses/${courseId}/preview`).then((r) => {
      if (!r.ok) throw new Error()
      return r.json()
    }),
  })

  useEffect(() => {
    if (course) {
      setExpandedMods(new Set([course.modules[0]?.id]))
    }
  }, [course])

  const totalLessons = course?.modules.reduce((s, m) => s + m.lessons.length, 0) ?? 0

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses/${courseId}`)
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfEnroll: true }),
      })
      if (res.status === 409) {
        toast.info("Ви вже записані на цей курс")
        router.push("/dashboard")
        return
      }
      if (!res.ok) throw new Error()
      toast.success("Ви записані! Починаємо навчання.")
      router.push("/dashboard")
    } catch {
      toast.error("Помилка запису. Спробуйте ще раз.")
    } finally {
      setEnrolling(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 w-full space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )

  if (isError || !course) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Курс не знайдено або недоступний</p>
        <Button variant="outline" asChild><Link href="/courses">До каталогу</Link></Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> До каталогу
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">Публічний курс</Badge>
                </div>
                <h1 className="text-3xl font-bold leading-snug mb-3">{course.title}</h1>
                {course.description && (
                  <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                )}
              </motion.div>

              {/* Teacher */}
              <Link href={`/teachers/${course.teacher.id}`} className="flex items-center gap-3 p-4 rounded-xl border bg-background hover:border-primary/40 transition-colors group">
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={course.teacher.image ?? ""} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {course.teacher.name?.[0]?.toUpperCase() ?? "T"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{course.teacher.name}</p>
                  <p className="text-xs text-muted-foreground">Викладач курсу</p>
                </div>
                <GraduationCap className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              {/* Stats row */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <LayoutList className="h-4 w-4" />
                  {course.modules.length} модулів
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} уроків
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course._count.enrollments} студентів
                </span>
              </div>

              {/* Curriculum */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Зміст курсу</h2>
                <div className="space-y-2">
                  {course.modules.map((mod) => (
                    <div key={mod.id} className="border rounded-xl overflow-hidden bg-background">
                      <button
                        onClick={() => setExpandedMods((prev) => {
                          const next = new Set(prev)
                          next.has(mod.id) ? next.delete(mod.id) : next.add(mod.id)
                          return next
                        })}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-sm">{mod.title}</p>
                          <p className="text-xs text-muted-foreground">{mod.lessons.length} уроків</p>
                        </div>
                        {expandedMods.has(mod.id)
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        }
                      </button>
                      {expandedMods.has(mod.id) && (
                        <div className="border-t">
                          {mod.lessons.map((lesson, i) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 text-sm",
                                i < mod.lessons.length - 1 && "border-b"
                              )}
                            >
                              {typeIcon(lesson.type)}
                              <span className="flex-1 text-muted-foreground">{lesson.title}</span>
                              {lesson.duration && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                  <Clock className="h-3 w-3" />{formatDuration(lesson.duration)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: CTA card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border bg-background shadow-lg p-6 space-y-4">
                <div className="h-2 -mx-6 -mt-6 mb-6 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{totalLessons} уроків у {course.modules.length} модулях</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{course._count.enrollments} студентів вже навчаються</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Безкоштовний доступ</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full rounded-full gap-2"
                  disabled={enrolling}
                  onClick={handleEnroll}
                >
                  {enrolling
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Запис...</>
                    : <><Play className="h-4 w-4" /> Почати навчання</>
                  }
                </Button>
                {!session && (
                  <p className="text-xs text-muted-foreground text-center">
                    Потрібна <Link href="/auth/login" className="text-primary hover:underline">реєстрація</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
