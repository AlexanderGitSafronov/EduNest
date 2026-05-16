import { Navbar } from "@/components/layout/Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Users, GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface TeacherCourse {
  id: string
  title: string
  description?: string
  thumbnail?: string
  _count: { enrollments: number; modules: number }
  modules: Array<{ _count: { lessons: number } }>
}

interface Teacher {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  createdAt: string
  courses: TeacherCourse[]
  _count: { courses: number }
}

async function getTeacher(id: string): Promise<Teacher | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/teachers/${id}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const teacher = await getTeacher(id)
  if (!teacher) notFound()

  const totalStudents = teacher.courses.reduce((s, c) => s + c._count.enrollments, 0)
  const totalLessons = teacher.courses.reduce(
    (s, c) => s + c.modules.reduce((ms, m) => ms + m._count.lessons, 0),
    0
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> До каталогу
          </Link>

          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 p-6 rounded-2xl bg-background border shadow-sm">
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarImage src={teacher.image ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                {teacher.name?.[0]?.toUpperCase() ?? "T"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold">{teacher.name ?? "Викладач"}</h1>
                <Badge variant="secondary" className="gap-1">
                  <GraduationCap className="h-3 w-3" /> Викладач
                </Badge>
              </div>
              {teacher.bio && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{teacher.bio}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {teacher.courses.length} публічних курсів
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {totalStudents} студентів
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {totalLessons} уроків
                </span>
              </div>
            </div>
          </div>

          {/* Courses */}
          <h2 className="text-xl font-semibold mb-5">Публічні курси</h2>
          {teacher.courses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Немає опублікованих курсів</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teacher.courses.map((course) => {
                const totalLess = course.modules.reduce((s, m) => s + m._count.lessons, 0)
                return (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="h-2 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    <CardHeader className="pb-3 flex-1">
                      <CardTitle className="text-base leading-snug line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{course.description || "Опис відсутній"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> {totalLess} уроків
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {course._count.enrollments} студентів
                        </span>
                      </div>
                      <Button size="sm" variant="gradient" className="w-full rounded-full" asChild>
                        <Link href={`/courses/${course.id}`}>Переглянути курс</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
