"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Plus, Save, Trash2, GripVertical, Video, FileText, ChevronDown, ChevronUp, Users, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"

interface Lesson { id: string; title: string; type: string; published: boolean; videoUrl?: string }
interface Module { id: string; title: string; lessons: Lesson[] }
interface Enrollment { user: { id: string; name: string; email: string; image?: string } }
interface Course {
  id: string; title: string; description?: string; thumbnail?: string; published: boolean
  modules: Module[]
  enrollments: Enrollment[]
}

export function CourseEditor({ course: initial }: { course: Course }) {
  const { t } = useTranslation()
  const [course, setCourse] = useState(initial)
  const [form, setForm] = useState({ title: course.title, description: course.description ?? "" })
  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState<{ title: string; videoUrl: string; type: "TEXT" | "VIDEO" | "MIXED" }>({ title: "", videoUrl: "", type: "TEXT" })
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set(course.modules.map(m => m.id)))
  const [saving, setSaving] = useState(false)
  const [addModuleOpen, setAddModuleOpen] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null)

  const saveCourse = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description }),
      })
      if (!res.ok) throw new Error()
      toast.success("Збережено!")
    } catch {
      toast.error("Помилка при збереженні")
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    })
    if (res.ok) {
      setCourse(c => ({ ...c, published: !c.published }))
      toast.success(course.published ? "Знято з публікації" : "Опубліковано!")
    }
  }

  const addModule = async () => {
    if (!moduleTitle.trim()) return
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: moduleTitle.trim(), courseId: course.id }),
    })
    if (res.ok) {
      const mod = await res.json()
      setCourse(c => ({ ...c, modules: [...c.modules, { ...mod, lessons: [] }] }))
      setModuleTitle("")
      setAddModuleOpen(false)
    }
  }

  const addLesson = async () => {
    if (!selectedModuleId || !lessonForm.title) return
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lessonForm, moduleId: selectedModuleId }),
    })
    if (res.ok) {
      const lesson = await res.json()
      setCourse(c => ({
        ...c,
        modules: c.modules.map(m => m.id === selectedModuleId ? { ...m, lessons: [...m.lessons, lesson] } : m),
      }))
      setAddLessonOpen(false)
      setLessonForm({ title: "", videoUrl: "", type: "TEXT" as const })
      toast.success("Урок додано!")
    } else {
      toast.error("Помилка при додаванні уроку")
    }
  }

  const removeStudent = async (studentId: string) => {
    const res = await fetch(`/api/courses/${course.id}/enroll`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    })
    if (res.ok) {
      setCourse(c => ({ ...c, enrollments: c.enrollments.filter(e => e.user.id !== studentId) }))
      toast.success("Студента видалено")
    }
  }

  const toggleMod = (id: string) => setExpandedMods(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Редагування курсу</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={course.published ? "success" : "secondary"}>
              {course.published ? t.course.published : t.course.draft}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{course.published ? "Опубліковано" : "Чернетка"}</span>
            <Switch checked={course.published} onCheckedChange={togglePublish} />
          </div>
          <Button variant="gradient" onClick={saveCourse} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Збереження..." : t.common.save}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="mb-6">
          <TabsTrigger value="content">Контент</TabsTrigger>
          <TabsTrigger value="settings">Налаштування</TabsTrigger>
          <TabsTrigger value="students">
            Студенти <Badge variant="secondary" className="ml-1.5">{course.enrollments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t.course.modules}</h2>
              <Button variant="outline" size="sm" onClick={() => setAddModuleOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> {t.course.addModule}
              </Button>
            </div>

            {course.modules.map((mod) => (
              <Card key={mod.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{mod.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{mod.lessons.length} уроків</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedModuleId(mod.id); setAddLessonOpen(true) }}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> {t.course.addLesson}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMod(mod.id)}>
                        {expandedMods.has(mod.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedMods.has(mod.id) && (
                  <CardContent className="pt-0">
                    {mod.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 pl-7">Немає уроків</p>
                    ) : (
                      <div className="space-y-2 ml-7">
                        {mod.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${lesson.type === "VIDEO" ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                                {lesson.type === "VIDEO" ? (
                                  <Video className="h-3.5 w-3.5 text-blue-500" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 text-purple-500" />
                                )}
                              </div>
                              <span className="text-sm font-medium">{lesson.title}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                              <Link href={`/lessons/${lesson.id}`}>Переглянути</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {course.modules.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">Немає модулів. Додайте перший модуль.</p>
                  <Button variant="outline" onClick={() => setAddModuleOpen(true)}><Plus className="mr-2 h-4 w-4" /> Додати модуль</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>{t.course.title}</Label>
                <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t.course.description}</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button variant="gradient" onClick={saveCourse} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? "Збереження..." : t.common.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="pt-6">
              {course.enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Немає студентів</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {course.enrollments.map((enrollment) => (
                    <div key={enrollment.user.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={enrollment.user.image} />
                          <AvatarFallback>{enrollment.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{enrollment.user.name}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.user.email}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8"
                        onClick={() => setDeleteStudentId(enrollment.user.id)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Module Dialog */}
      <Dialog open={addModuleOpen} onOpenChange={(o) => { setAddModuleOpen(o); if (!o) setModuleTitle("") }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Новий модуль</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label className="mb-2 block">Назва модуля</Label>
            <Input
              placeholder="Введіть назву..."
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addModule()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModuleOpen(false)}>{t.common.cancel}</Button>
            <Button variant="gradient" onClick={addModule} disabled={!moduleTitle.trim()}>Додати</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Student Dialog */}
      <Dialog open={!!deleteStudentId} onOpenChange={(o) => { if (!o) setDeleteStudentId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Видалити студента?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Студент втратить доступ до курсу. Цю дію можна скасувати, додавши студента повторно.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStudentId(null)}>{t.common.cancel}</Button>
            <Button variant="destructive" onClick={() => { if (deleteStudentId) removeStudent(deleteStudentId); setDeleteStudentId(null) }}>Видалити</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.lesson.create}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t.lesson.title}</Label>
              <Input placeholder="Назва уроку..." value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>URL відео (YouTube, Vimeo тощо)</Label>
              <Input placeholder="https://..." value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Тип уроку</Label>
              <div className="grid grid-cols-3 gap-2">
                {["TEXT", "VIDEO", "MIXED"].map(type => (
                  <button key={type} type="button"
                    onClick={() => setLessonForm(f => ({ ...f, type: type as "TEXT" | "VIDEO" | "MIXED" }))}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${lessonForm.type === type ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLessonOpen(false)}>{t.common.cancel}</Button>
            <Button variant="gradient" onClick={addLesson} disabled={!lessonForm.title}>{t.lesson.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
