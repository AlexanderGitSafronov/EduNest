"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageCircle, Send, Trash2, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CommentUser { id: string; name: string | null; image: string | null }
interface Reply { id: string; content: string; createdAt: string; user: CommentUser }
interface Comment {
  id: string
  content: string
  createdAt: string
  user: CommentUser
  replies: Reply[]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "щойно"
  if (m < 60) return `${m} хв тому`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} год тому`
  return `${Math.floor(h / 24)} дн тому`
}

function CommentItem({
  comment, lessonId, userId, onDelete,
}: { comment: Comment; lessonId: string; userId: string; onDelete: (id: string) => void }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [repliesOpen, setRepliesOpen] = useState(true)
  const [replyText, setReplyText] = useState("")
  const qc = useQueryClient()

  const replyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, parentId: comment.id }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      setReplyText("")
      setReplyOpen(false)
      qc.invalidateQueries({ queryKey: ["comments", lessonId] })
    },
    onError: () => toast.error("Не вдалося відповісти"),
  })

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarImage src={comment.user.image ?? ""} />
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
          {comment.user.name?.[0]?.toUpperCase() ?? "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-xl px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.name ?? "Користувач"}</span>
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={() => setReplyOpen(!replyOpen)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <CornerDownRight className="h-3 w-3" /> Відповісти
          </button>
          {comment.replies.length > 0 && (
            <button
              onClick={() => setRepliesOpen(!repliesOpen)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {repliesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {comment.replies.length} відповід{comment.replies.length === 1 ? "ь" : "і"}
            </button>
          )}
          {comment.user.id === userId && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-destructive/60 hover:text-destructive transition-colors flex items-center gap-1 ml-auto"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {replyOpen && (
          <div className="mt-2 flex gap-2">
            <Textarea
              placeholder="Написати відповідь..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="text-sm min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && replyText.trim()) {
                  replyMutation.mutate()
                }
              }}
            />
            <Button
              size="sm"
              variant="gradient"
              className="self-end rounded-full px-3"
              disabled={!replyText.trim() || replyMutation.isPending}
              onClick={() => replyMutation.mutate()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {repliesOpen && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2 pl-2 border-l-2 border-muted">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                  <AvatarImage src={reply.user.image ?? ""} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px]">
                    {reply.user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="font-medium text-xs">{reply.user.name ?? "Користувач"}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsSection({ lessonId, userId }: { lessonId: string; userId: string }) {
  const [text, setText] = useState("")
  const qc = useQueryClient()

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", lessonId],
    queryFn: () => fetch(`/api/lessons/${lessonId}/comments`).then((r) => r.json()),
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => {
      setText("")
      qc.invalidateQueries({ queryKey: ["comments", lessonId] })
    },
    onError: () => toast.error("Не вдалося надіслати коментар"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      })
      if (!res.ok) throw new Error()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", lessonId] }),
    onError: () => toast.error("Не вдалося видалити"),
  })

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Коментарі {comments && comments.length > 0 && <span className="text-muted-foreground font-normal">({comments.length})</span>}
      </h3>

      <div className="flex gap-3 mb-6">
        <Textarea
          placeholder="Задайте питання або залиште коментар..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[80px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && text.trim()) {
              addMutation.mutate()
            }
          }}
        />
        <Button
          size="sm"
          variant="gradient"
          className="self-end rounded-full px-4"
          disabled={!text.trim() || addMutation.isPending}
          onClick={() => addMutation.mutate()}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Надіслати
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Поки немає коментарів. Будьте першим!</p>
      ) : (
        <div className={cn("space-y-4")}>
          {comments?.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              lessonId={lessonId}
              userId={userId}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
