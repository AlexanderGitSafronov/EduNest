"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BookMarked, Send, CheckCircle2, Star, ChevronDown, ChevronUp, Loader2, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Submission {
  id: string
  content: string
  grade?: number
  feedback?: string
  createdAt: string
  user?: { id: string; name: string | null; email: string; image: string | null }
}

interface Homework {
  id: string
  title: string
  description: string
  submissions: Submission[]
}

function TeacherHomeworkEditor({ lessonId, homework, onSaved }: {
  lessonId: string
  homework: Homework | null
  onSaved: () => void
}) {
  const [open, setOpen] = useState(!homework)
  const [title, setTitle] = useState(homework?.title ?? "")
  const [description, setDescription] = useState(homework?.description ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lessons/${lessonId}/homework`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error()
      toast.success("Домашнє завдання збережено!")
      onSaved()
      setOpen(false)
    } catch {
      toast.error("Помилка збереження")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{homework?.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{homework?.description}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Редагувати</Button>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Назва завдання</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наприклад: Практична робота з React hooks" />
      </div>
      <div className="space-y-1.5">
        <Label>Опис завдання</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишіть що потрібно зробити студенту..."
          className="min-h-[100px]"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="gradient" disabled={saving} onClick={handleSave} className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Зберегти
        </Button>
        {homework && <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Скасувати</Button>}
      </div>
    </div>
  )
}

export function HomeworkSection({ lessonId, role }: { lessonId: string; role: string }) {
  const [answer, setAnswer] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: homework, isLoading, refetch } = useQuery<Homework | null>({
    queryKey: ["homework", lessonId],
    queryFn: () => fetch(`/api/lessons/${lessonId}/homework`).then((r) => r.json()),
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answer }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      setAnswer("")
      qc.invalidateQueries({ queryKey: ["homework", lessonId] })
      toast.success("Відповідь надіслано!")
    },
    onError: () => toast.error("Помилка надсилання"),
  })

  const gradeMutation = useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: { submissionId: string; grade: number; feedback: string }) => {
      const res = await fetch(`/api/lessons/${lessonId}/homework`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, grade, feedback }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homework", lessonId] })
      toast.success("Оцінку збережено!")
    },
  })

  if (isLoading) return <Skeleton className="h-24 rounded-xl mt-8" />

  if (role === "TEACHER") {
    return (
      <div className="mt-8">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          Домашнє завдання
        </h3>
        <div className="border rounded-xl p-4 space-y-4">
          <TeacherHomeworkEditor lessonId={lessonId} homework={homework ?? null} onSaved={() => refetch()} />

          {homework && homework.submissions.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Відповіді студентів ({homework.submissions.length})</p>
              <div className="space-y-3">
                {homework.submissions.map((sub) => (
                  <SubmissionRow key={sub.id} submission={sub} expanded={expandedId === sub.id}
                    onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                    onGrade={(grade, feedback) => gradeMutation.mutate({ submissionId: sub.id, grade, feedback })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Student view
  if (!homework) return null

  const mySubmission = homework.submissions[0]

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <BookMarked className="h-4 w-4" />
        Домашнє завдання
      </h3>
      <div className="border rounded-xl p-4 space-y-3">
        <div>
          <p className="font-medium text-sm">{homework.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">{homework.description}</p>
        </div>

        {mySubmission ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Відповідь надіслано
              {mySubmission.grade !== null && mySubmission.grade !== undefined && (
                <Badge variant="secondary" className="ml-auto gap-1">
                  <Star className="h-3 w-3" /> {mySubmission.grade}/10
                </Badge>
              )}
            </div>
            <div className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground">
              {mySubmission.content}
            </div>
            {mySubmission.feedback && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2 text-sm border border-blue-200/50 dark:border-blue-800/50">
                <p className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-1">Відгук викладача</p>
                <p className="text-foreground">{mySubmission.feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Напишіть відповідь..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[100px] text-sm"
            />
            <Button
              size="sm"
              variant="gradient"
              disabled={!answer.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
              className="gap-1.5"
            >
              {submitMutation.isPending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Надсилаю...</>
                : <><Send className="h-3.5 w-3.5" /> Надіслати відповідь</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionRow({ submission, expanded, onToggle, onGrade }: {
  submission: Submission
  expanded: boolean
  onToggle: () => void
  onGrade: (grade: number, feedback: string) => void
}) {
  const [grade, setGrade] = useState(submission.grade?.toString() ?? "")
  const [feedback, setFeedback] = useState(submission.feedback ?? "")

  return (
    <div className="border rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={submission.user?.image ?? ""} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            {submission.user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm flex-1">{submission.user?.name ?? submission.user?.email}</span>
        {submission.grade !== null && submission.grade !== undefined && (
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Star className="h-3 w-3" /> {submission.grade}/10
          </Badge>
        )}
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t p-3 space-y-3 bg-muted/20">
          <p className="text-sm whitespace-pre-wrap">{submission.content}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Оцінка (0–10)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Відгук</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => onGrade(parseInt(grade) || 0, feedback)}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" /> Зберегти оцінку
          </Button>
        </div>
      )}
    </div>
  )
}
