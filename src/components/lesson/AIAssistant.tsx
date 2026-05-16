"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Sparkles, Send, X, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Message { role: "user" | "ai"; text: string }

export function AIAssistant({ lessonTitle, lessonContent }: { lessonTitle: string; lessonContent?: string }) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const askMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lessonTitle, lessonContent }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Помилка")
      }
      return res.json() as Promise<{ answer: string }>
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }])
    },
    onError: (err: Error) => {
      setMessages((prev) => [...prev, { role: "ai", text: `Помилка: ${err.message}` }])
    },
  })

  const send = () => {
    if (!question.trim() || askMutation.isPending) return
    const q = question.trim()
    setMessages((prev) => [...prev, { role: "user", text: q }])
    setQuestion("")
    askMutation.mutate(q)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 rounded-full border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Спитати ШІ
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-full max-w-sm z-50 bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">ШІ Асистент</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{lessonTitle}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Задайте питання по темі уроку</p>
                  <div className="mt-3 space-y-1.5">
                    {["Поясни простими словами", "Наведи приклад", "Як це застосувати?"].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => { setQuestion(hint); }}
                        className="block w-full text-left text-xs px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {askMutation.isPending && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t flex gap-2">
              <Textarea
                placeholder="Ваше питання..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <Button
                size="sm"
                variant="gradient"
                className="self-end rounded-full"
                disabled={!question.trim() || askMutation.isPending}
                onClick={send}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
