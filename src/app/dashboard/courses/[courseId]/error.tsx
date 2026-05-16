"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function CourseEditorError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("Course editor error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertTriangle className="h-12 w-12 text-destructive/70 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Не вдалося завантажити курс</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Виникла помилка при завантаженні редактора курсу. Спробуйте ще раз.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => unstable_retry()}>
            Спробувати знову
          </Button>
          <Button asChild>
            <Link href="/dashboard">На головну</Link>
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground/50 mt-4">Код: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
