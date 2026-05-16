"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, FileText, Download, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"
import { formatBytes } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"

function VideoPlayer({ url, onEnded }: { url: string; onEnded?: () => void }) {
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
  const isVimeo = url.includes("vimeo.com")

  if (isYouTube || isVimeo) {
    let videoId = ""
    if (isYouTube) {
      try {
        const u = new URL(url)
        videoId = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop() ?? ""
      } catch {
        videoId = url.split("/").filter(Boolean).pop() ?? ""
      }
    }
    const src = isYouTube
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${url.split("/").filter(Boolean).pop() ?? ""}`
    return (
      <iframe
        src={src}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <video
      src={url}
      className="w-full h-full"
      controls
      onEnded={onEnded}
    />
  )
}

interface Lesson {
  id: string
  title: string
  description?: string
  content?: string
  videoUrl?: string
  duration?: number
  type: string
  attachments: Array<{ id: string; name: string; url: string; type: string; size?: number }>
  progress: Array<{ completed: boolean; watchedSecs: number }>
  module: {
    course: {
      id: string
      title: string
      modules: Array<{
        id: string
        title: string
        lessons: Array<{ id: string; title: string; duration?: number; type: string }>
      }>
    }
  }
}

interface Props {
  lesson: Lesson
  userId: string
  role: string
}

export function LessonViewer({ lesson, userId, role }: Props) {
  const { t } = useTranslation()
  const [completed, setCompleted] = useState(lesson.progress[0]?.completed ?? false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([lesson.module.course.modules[0]?.id]))

  const course = lesson.module.course
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = allLessons[currentIndex - 1]
  const nextLesson = allLessons[currentIndex + 1]

  const totalLessons = allLessons.length
  const completedCount = currentIndex + (completed ? 1 : 0)
  const progressPct = Math.round((completedCount / totalLessons) * 100)

  const markCompleteMutation = useMutation({
    mutationFn: async (isCompleted: boolean) => {
      const res = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isCompleted }),
      })
      if (!res.ok) throw new Error("Failed to update progress")
    },
    onSuccess: (_, isCompleted) => {
      setCompleted(isCompleted)
      toast.success(isCompleted ? "Урок позначено як завершений ✓" : "Урок відзначено як незавершений")
    },
  })

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 border-r bg-card overflow-hidden"
      >
        <div className="w-80 h-full flex flex-col">
          <div className="p-4 border-b">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
              <ChevronLeft className="h-4 w-4" /> До панелі
            </Link>
            <h2 className="font-semibold text-sm leading-snug">{course.title}</h2>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{completedCount}/{totalLessons} уроків</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {course.modules.map((mod) => (
                <div key={mod.id} className="mb-2">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium text-left"
                  >
                    <span className="truncate">{mod.title}</span>
                    {expandedModules.has(mod.id) ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                  </button>
                  {expandedModules.has(mod.id) && (
                    <div className="ml-2 mt-1 space-y-0.5">
                      {mod.lessons.map((l) => (
                        <Link
                          key={l.id}
                          href={`/lessons/${l.id}`}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                            l.id === lesson.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {l.id === lesson.id ? (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{l.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0">
              <BookOpen className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              {lesson.description && <p className="text-muted-foreground text-sm mt-1">{lesson.description}</p>}
            </div>
            <Badge variant="outline" className="shrink-0">{lesson.type}</Badge>
          </div>

          {/* Video player */}
          {lesson.videoUrl && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
              <VideoPlayer
                url={lesson.videoUrl}
                onEnded={() => !completed && markCompleteMutation.mutate(true)}
              />
            </motion.div>
          )}

          {/* Text content */}
          {lesson.content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 prose-lesson"
              dangerouslySetInnerHTML={{ __html: lesson.content.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+="[^"]*"/g, "") }}
            />
          )}

          {/* Attachments */}
          {lesson.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t.lesson.attachments}
              </h3>
              <div className="space-y-2">
                {lesson.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        {file.size && <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        {t.lesson.download}
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation & Complete */}
          <div className="mt-8 pt-6 border-t">
            {/* Complete button — centered, prominent */}
            <div className="flex justify-center mb-5">
              <Button
                size="lg"
                variant={completed ? "outline" : "gradient"}
                onClick={() => markCompleteMutation.mutate(!completed)}
                disabled={markCompleteMutation.isPending}
                className={`gap-2 px-8 rounded-full transition-all ${completed ? "border-green-500/50 text-green-500 hover:bg-green-500/5" : ""}`}
              >
                {completed ? (
                  <><CheckCircle2 className="h-5 w-5" /> {t.lesson.completed}</>
                ) : (
                  <><Circle className="h-5 w-5" /> {t.lesson.markComplete}</>
                )}
              </Button>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevLesson ? (
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Link href={`/lessons/${prevLesson.id}`}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.common.previous}</span>
                  </Link>
                </Button>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Button variant="gradient" size="sm" asChild className="gap-1.5 rounded-full px-5 ml-auto">
                  <Link href={`/lessons/${nextLesson.id}`}>
                    {t.common.next} <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
