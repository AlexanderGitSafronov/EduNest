"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Users, Play, Search, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/layout/Navbar"
import { toast } from "sonner"

interface PublicCourse {
  id: string
  title: string
  description?: string
  teacher: { name: string; image?: string }
  _count: { enrollments: number; modules: number }
  modules: Array<{ _count: { lessons: number } }>
}

async function fetchPublicCourses(): Promise<PublicCourse[]> {
  const res = await fetch("/api/courses/public", { cache: "no-store" })
  if (!res.ok) throw new Error()
  return res.json()
}

function CourseCard({ course, onEnroll, enrolling }: {
  course: PublicCourse
  onEnroll: (id: string) => void
  enrolling: string | null
}) {
  const totalLessons = course.modules.reduce((s, m) => s + m._count.lessons, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }}>
      <Card className="group hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="h-2 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="pb-3 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">Публічний</Badge>
          </div>
          <CardTitle className="text-lg leading-snug line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description || "Опис відсутній"}</CardDescription>
          <p className="text-xs text-muted-foreground">Викладач: {course.teacher.name}</p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> {totalLessons} уроків
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {course._count.enrollments} студентів
            </span>
          </div>
          <Button
            size="sm"
            variant="gradient"
            className="w-full rounded-full"
            disabled={enrolling === course.id}
            onClick={() => onEnroll(course.id)}
          >
            {enrolling === course.id ? (
              <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Запис...</>
            ) : (
              <><Play className="mr-2 h-3.5 w-3.5" />Записатися</>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function CourseCatalogPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [enrolling, setEnrolling] = useState<string | null>(null)

  const { data: courses, isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: fetchPublicCourses,
  })

  const filtered = courses?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher.name.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses`)
      return
    }
    setEnrolling(courseId)
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
      toast.success("Ви записані на курс!")
      router.push("/dashboard")
    } catch {
      toast.error("Помилка запису. Спробуйте ще раз.")
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Каталог курсів</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Знайдіть курс, який підходить саме вам, і почніть навчання прямо зараз
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук курсів або викладачів..."
              className="pl-9 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Courses grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed max-w-md mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {search ? "Нічого не знайдено" : "Поки що немає публічних курсів"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {search ? "Спробуйте змінити запит" : "Завітайте пізніше — нові курси з'являться тут"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} onEnroll={handleEnroll} enrolling={enrolling} />
              ))}
            </div>
          )}

          {/* CTA for teachers */}
          {session && (session.user as { role?: string })?.role === "TEACHER" && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground text-sm mb-3">Хочете, щоб ваш курс також з'явився тут?</p>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Опублікувати курс</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
