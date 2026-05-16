"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, XCircle, HelpCircle, RefreshCw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  position: number
}

interface QuizQuestion {
  id: string
  question: string
  position: number
  options: QuizOption[]
}

export function QuizSection({ lessonId }: { lessonId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  const { data: questions, isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ["quiz", lessonId],
    queryFn: () => fetch(`/api/lessons/${lessonId}/quiz`).then((r) => r.json()),
  })

  if (isLoading) return <Skeleton className="h-40 rounded-xl" />
  if (!questions || questions.length === 0) return (
    <div className="mt-6 p-5 rounded-xl border border-dashed text-center">
      <HelpCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Квіз ще не створено</p>
    </div>
  )

  const correct = submitted
    ? questions.filter((q) => {
        const correctOpt = q.options.find((o) => o.isCorrect)
        return correctOpt && answers[q.id] === correctOpt.id
      }).length
    : 0

  const total = questions.length
  const score = Math.round((correct / total) * 100)

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
    setCurrentQ(0)
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
        <div className={cn(
          "rounded-2xl p-6 text-center border-2",
          score >= 80
            ? "border-green-500/30 bg-green-500/5"
            : score >= 50
            ? "border-yellow-500/30 bg-yellow-500/5"
            : "border-red-500/30 bg-red-500/5"
        )}>
          <div className="text-5xl mb-3">
            {score >= 80 ? "🏆" : score >= 50 ? "📚" : "💪"}
          </div>
          <p className="text-2xl font-bold mb-1">{score}%</p>
          <p className="text-sm text-muted-foreground mb-4">{correct} з {total} правильних відповідей</p>

          <div className="space-y-2 mb-5 text-left">
            {questions.map((q, i) => {
              const correctOpt = q.options.find((o) => o.isCorrect)!
              const chosen = q.options.find((o) => o.id === answers[q.id])
              const isRight = chosen?.id === correctOpt.id
              return (
                <div key={q.id} className={cn("rounded-lg px-3 py-2.5 text-sm", isRight ? "bg-green-500/10" : "bg-red-500/10")}>
                  <div className="flex items-start gap-2">
                    {isRight
                      ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    }
                    <div>
                      <p className="font-medium text-xs text-muted-foreground mb-0.5">Питання {i + 1}</p>
                      <p>{q.question}</p>
                      {!isRight && chosen && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Ваша відповідь: {chosen.text}
                        </p>
                      )}
                      {!isRight && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          Правильно: {correctOpt.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Пройти знову
          </Button>
        </div>
      </motion.div>
    )
  }

  const q = questions[currentQ]
  const allAnswered = questions.every((q) => answers[q.id])

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-purple-500" />
          Перевір себе
        </h3>
        <span className="text-sm text-muted-foreground">{currentQ + 1} / {total}</span>
      </div>

      <div className="flex gap-1 mb-2">
        {questions.map((_, i) => (
          <div key={i} className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i < currentQ ? "bg-primary" : i === currentQ ? "bg-primary/50" : "bg-muted"
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <p className="font-medium leading-snug">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                  answers[q.id] === opt.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled={currentQ === 0} onClick={() => setCurrentQ((q) => q - 1)}>
          ← Назад
        </Button>
        {currentQ < total - 1 ? (
          <Button
            size="sm"
            variant="gradient"
            disabled={!answers[q.id]}
            onClick={() => setCurrentQ((q) => q + 1)}
            className="rounded-full px-5"
          >
            Далі →
          </Button>
        ) : (
          <Button
            size="sm"
            variant="gradient"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="rounded-full px-5 gap-2"
          >
            <Trophy className="h-3.5 w-3.5" /> Перевірити
          </Button>
        )}
      </div>
    </div>
  )
}
