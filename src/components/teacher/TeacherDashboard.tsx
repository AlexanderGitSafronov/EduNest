"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, BookOpen, Users, Video, TrendingUp, MoreVertical, Edit2, Trash2, Eye, EyeOff, UserPlus, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TracksManager } from "./TracksManager"

interface Course {
  id: string
  title: string
  description?: string
  thumbnail?: string
  published: boolean
  createdAt: string
  _count: { enrollments: number; modules: number }
  modules: Array<{ _count: { lessons: number } }>
}

async function fetchCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses", { cache: "no-store" })
  if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`)
  return res.json()
}

async function createCourse(data: { title: string; description: string }): Promise<Course> {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create course")
  return res.json()
}

async function deleteCourse(id: string) {
  const res = await fetch(`/api/courses/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete course")
}

async function togglePublish(id: string, published: boolean) {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ published }),
  })
  if (!res.ok) throw new Error("Failed to update course")
  return res.json()
}

export function TeacherDashboard() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({ title: "", description: "" })
  const [studentEmail, setStudentEmail] = useState("")
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)

  const { data: courses, isLoading, isError, refetch } = useQuery({ queryKey: ["courses"], queryFn: fetchCourses })

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      setCreateOpen(false)
      setForm({ title: "", description: "" })
      toast.success("Курс створено!")
    },
    onError: () => toast.error("Помилка при створенні курсу"),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      toast.success("Курс видалено")
    },
    onError: () => toast.error("Помилка при видаленні"),
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) => togglePublish(id, published),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  })

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${selectedCourse?.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Помилка ${res.status}`)
      }
    },
    onSuccess: () => {
      toast.success("Студента додано до курсу")
      setEnrollOpen(false)
      setStudentEmail("")
      queryClient.invalidateQueries({ queryKey: ["courses"] })
    },
    onError: (err) => toast.error(err.message || "Помилка"),
  })

  const totalLessons = courses?.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + (m._count?.lessons ?? 0), 0),
    0
  ) ?? 0
  const totalStudents = courses?.reduce((sum, c) => sum + c._count.enrollments, 0) ?? 0

  const stats = [
    { label: t.dashboard.teacher.totalCourses, value: courses?.length ?? 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: t.dashboard.teacher.totalStudents, value: totalStudents, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { label: t.dashboard.teacher.totalLessons, value: totalLessons, icon: Video, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Опубліковано", value: courses?.filter((c) => c.published).length ?? 0, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.teacher.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.dashboard.welcome}, {session?.user?.name?.split(" ")[0]}! 👋
          </p>
        </div>
        <Button variant="gradient" onClick={() => setCreateOpen(true)} id="create-course-btn">
          <Plus className="mr-2 h-4 w-4" />
          {t.course.create}
        </Button>
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

      {/* Courses + Tracks tabs */}
      <Tabs defaultValue="courses">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">{t.dashboard.teacher.courses}</TabsTrigger>
          <TabsTrigger value="tracks">Навчальні треки</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks">
          <TracksManager />
        </TabsContent>

        <TabsContent value="courses">
      <div>
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
              <h3 className="font-semibold text-lg mb-2">Немає курсів</h3>
              <p className="text-muted-foreground text-sm mb-6">Створіть свій перший курс</p>
              <Button variant="gradient" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> {t.course.create}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                <Card className="group hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
                  <div className="h-2 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-snug truncate">{course.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {course.description || "Опис відсутній"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/courses/${course.id}`}>
                              <Edit2 className="mr-2 h-4 w-4" /> {t.course.edit}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => publishMutation.mutate({ id: course.id, published: !course.published })}>
                            {course.published ? <><EyeOff className="mr-2 h-4 w-4" /> {t.course.unpublish}</> : <><Eye className="mr-2 h-4 w-4" /> {t.course.publish}</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedCourse(course); setEnrollOpen(true) }}>
                            <UserPlus className="mr-2 h-4 w-4" /> {t.course.giveAccess}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteCourseId(course.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> {t.course.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course._count.enrollments} студентів</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course._count.modules} модулів</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={course.published ? "success" : "secondary"}>
                        {course.published ? t.course.published : t.course.draft}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>{t.course.edit}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.course.create}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t.course.title}</Label>
              <Input placeholder="Назва курсу..." value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.course.description}</Label>
              <Textarea placeholder="Опис курсу..." rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t.common.cancel}</Button>
            <Button variant="gradient" onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending}>
              {createMutation.isPending ? "Створення..." : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enroll Student Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.course.giveAccess} — {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email студента</Label>
              <Input type="email" placeholder="student@example.com" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>{t.common.cancel}</Button>
            <Button variant="gradient" onClick={() => enrollMutation.mutate()} disabled={!studentEmail || enrollMutation.isPending}>
              {enrollMutation.isPending ? "Додавання..." : t.course.giveAccess}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Course Dialog */}
      <Dialog open={!!deleteCourseId} onOpenChange={(o) => { if (!o) setDeleteCourseId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Видалити курс?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Курс та всі його модулі й уроки будуть видалені назавжди. Цю дію неможливо скасувати.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCourseId(null)}>{t.common.cancel}</Button>
            <Button variant="destructive" onClick={() => { if (deleteCourseId) deleteMutation.mutate(deleteCourseId); setDeleteCourseId(null) }}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Видалення..." : "Видалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
