"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { StickyNote, Save, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function NotesSection({ lessonId }: { lessonId: string }) {
  const [text, setText] = useState("")
  const [saved, setSaved] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", lessonId],
    queryFn: () => fetch(`/api/lessons/${lessonId}/notes`).then((r) => r.json()),
  })

  useEffect(() => {
    if (note?.content !== undefined) {
      setText(note.content)
    }
  }, [note])

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/lessons/${lessonId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
    onError: () => toast.error("Не вдалося зберегти нотатку"),
  })

  const handleChange = (value: string) => {
    setText(value)
    setSaved(false)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      saveMutation.mutate(value)
    }, 1500)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Мої нотатки
        </h3>
        {text && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {saved ? (
              <><Check className="h-3 w-3 text-green-500" /> Збережено</>
            ) : saveMutation.isPending ? (
              "Збереження..."
            ) : (
              "Автозбереження"
            )}
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : (
        <div className="relative">
          <Textarea
            placeholder="Записуйте важливі думки, терміни, питання — тільки для вас..."
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[120px] resize-y text-sm bg-yellow-50/40 dark:bg-yellow-950/10 border-yellow-200/50 dark:border-yellow-800/30 focus:border-yellow-400/50 placeholder:text-muted-foreground/50"
          />
          {text && !saved && !saveMutation.isPending && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute bottom-2 right-2 h-7 gap-1 text-xs text-muted-foreground"
              onClick={() => {
                if (saveTimeout.current) clearTimeout(saveTimeout.current)
                saveMutation.mutate(text)
              }}
            >
              <Save className="h-3 w-3" /> Зберегти
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
