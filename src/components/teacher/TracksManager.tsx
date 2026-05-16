"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Globe, Lock, GripVertical, BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CourseInTrack {
  id: string
  title: string
  thumbnail?: string
}

interface TrackCourse {
  id: string
  position: number
  course: CourseInTrack
}

interface Track {
  id: string
  title: string
  description?: string
  isPublic: boolean
  trackCourses: TrackCourse[]
  _count: { trackCourses: number }
}

interface TeacherCourse {
  id: string
  title: string
  thumbnail?: string
  published: boolean
}

export function TracksManager() {
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTrack, setEditTrack] = useState<Track | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", description: "" })

  const { data: tracks, isLoading } = useQuery<Track[]>({
    queryKey: ["tracks"],
    queryFn: () => fetch("/api/tracks").then((r) => r.json()),
  })

  const { data: myCourses } = useQuery<TeacherCourse[]>({
    queryKey: ["courses"],
    queryFn: () => fetch("/api/courses").then((r) => r.json()),
  })

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; courseIds: string[] }) =>
      fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] })
      setCreateOpen(false)
      setForm({ title: "", description: "" })
      toast.success("Трек створено!")
    },
    onError: () => toast.error("Помилка створення"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/tracks/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] })
      toast.success("Трек видалено")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; isPublic?: boolean; courseIds?: string[] }) =>
      fetch(`/api/tracks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tracks"] }),
  })

  return (
    <div className="space-y-5 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Навчальні треки</h2>
          <p className="text-sm text-muted-foreground">Об'єднайте кілька курсів у навчальний шлях</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Новий трек
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !tracks?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-medium mb-1">Немає треків</p>
            <p className="text-sm text-muted-foreground mb-4">Об'єднайте курси у навчальний шлях, наприклад "Junior Dev"</p>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Створити перший трек
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="border rounded-xl overflow-hidden bg-background">
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{track.title}</p>
                    <Badge variant={track.isPublic ? "secondary" : "outline"} className="gap-1 text-xs">
                      {track.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {track.isPublic ? "Публічний" : "Приватний"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {track.trackCourses.length} курсів
                    </Badge>
                  </div>
                  {track.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{track.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{track.isPublic ? "Публічний" : "Приватний"}</span>
                    <Switch
                      checked={track.isPublic}
                      onCheckedChange={(v) => updateMutation.mutate({ id: track.id, isPublic: v })}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTrack(track)}
                  >
                    Редагувати
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(track.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setExpandedId(expandedId === track.id ? null : track.id)}
                  >
                    {expandedId === track.id
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>

              {expandedId === track.id && track.trackCourses.length > 0 && (
                <div className="border-t bg-muted/20">
                  {track.trackCourses.map((tc, i) => (
                    <div key={tc.id} className={cn("flex items-center gap-3 px-4 py-2.5", i < track.trackCourses.length - 1 && "border-b")}>
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {tc.position + 1}
                      </div>
                      {tc.course.thumbnail && (
                        <img src={tc.course.thumbnail} alt="" className="w-10 h-7 rounded object-cover shrink-0" />
                      )}
                      <span className="text-sm">{tc.course.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateTrackDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        courses={myCourses?.filter((c) => c.published) ?? []}
        onCreate={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />

      {/* Edit dialog */}
      {editTrack && (
        <EditTrackDialog
          track={editTrack}
          courses={myCourses?.filter((c) => c.published) ?? []}
          onClose={() => setEditTrack(null)}
          onSave={(courseIds) => {
            updateMutation.mutate({ id: editTrack.id, courseIds })
            setEditTrack(null)
            toast.success("Трек оновлено!")
          }}
        />
      )}
    </div>
  )
}

function CreateTrackDialog({ open, onClose, courses, onCreate, isPending }: {
  open: boolean
  onClose: () => void
  courses: TeacherCourse[]
  onCreate: (data: { title: string; description: string; courseIds: string[] }) => void
  isPending: boolean
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggle = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Новий навчальний трек</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Назва треку</Label>
            <Input placeholder="Наприклад: Junior Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Опис (необов'язково)</Label>
            <Textarea placeholder="Що студент вивчить після проходження треку?" value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Оберіть курси (у порядку проходження)</Label>
            {courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Немає опублікованих курсів. Спочатку опублікуйте курс.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all",
                      selectedIds.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    {selectedIds.includes(c.id) && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 font-bold">
                        {selectedIds.indexOf(c.id) + 1}
                      </span>
                    )}
                    {!selectedIds.includes(c.id) && <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />}
                    {c.thumbnail && <img src={c.thumbnail} alt="" className="w-8 h-6 rounded object-cover shrink-0" />}
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
          <Button
            variant="gradient"
            disabled={!title.trim() || selectedIds.length === 0 || isPending}
            onClick={() => onCreate({ title, description, courseIds: selectedIds })}
          >
            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Створення...</> : "Створити трек"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditTrackDialog({ track, courses, onClose, onSave }: {
  track: Track
  courses: TeacherCourse[]
  onClose: () => void
  onSave: (courseIds: string[]) => void
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    track.trackCourses.sort((a, b) => a.position - b.position).map((tc) => tc.course.id)
  )

  const toggle = (id: string) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Редагувати трек: {track.title}</DialogTitle></DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Курси (у порядку проходження)</Label>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-all",
                  selectedIds.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}
              >
                {selectedIds.includes(c.id) ? (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 font-bold">
                    {selectedIds.indexOf(c.id) + 1}
                  </span>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                )}
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Скасувати</Button>
          <Button variant="gradient" onClick={() => onSave(selectedIds)} disabled={selectedIds.length === 0}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
