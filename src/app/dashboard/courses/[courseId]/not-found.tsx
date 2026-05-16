import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function CourseNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Курс не знайдено</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Цей курс не існує або у вас немає доступу до нього.
        </p>
        <Button asChild>
          <Link href="/dashboard">Повернутися до курсів</Link>
        </Button>
      </div>
    </div>
  )
}
