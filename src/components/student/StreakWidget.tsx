"use client"

import { useQuery } from "@tanstack/react-query"
import { Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StreakWidget() {
  const { data } = useQuery<{ streak: number; totalDays: number }>({
    queryKey: ["streak"],
    queryFn: () => fetch("/api/user/streak").then((r) => r.json()),
  })

  if (!data) return null

  const { streak } = data

  return (
    <Card className={cn(
      "border-0 shadow-sm overflow-hidden",
      streak >= 7 ? "bg-gradient-to-br from-orange-500/10 to-red-500/10" : "bg-muted/30"
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Стрік навчання</p>
            <div className="flex items-end gap-1 mt-1">
              <p className={cn("text-3xl font-bold", streak > 0 ? "text-orange-500" : "text-muted-foreground")}>
                {streak}
              </p>
              <p className="text-sm text-muted-foreground mb-0.5">дн.</p>
            </div>
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            streak >= 7 ? "bg-orange-500/20" : streak > 0 ? "bg-orange-500/10" : "bg-muted"
          )}>
            <Flame className={cn(
              "h-6 w-6",
              streak >= 7 ? "text-orange-500" : streak > 0 ? "text-orange-400" : "text-muted-foreground"
            )} />
          </div>
        </div>
        {streak === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Завершіть урок сьогодні, щоб почати стрік 🔥</p>
        )}
        {streak > 0 && streak < 7 && (
          <p className="text-xs text-muted-foreground mt-2">До тижневого стріку: {7 - streak} дн.</p>
        )}
        {streak >= 7 && (
          <p className="text-xs text-orange-500 mt-2 font-medium">🔥 Вогонь! {streak >= 30 ? "Місяць навчання!" : "Тижневий стрік!"}</p>
        )}
      </CardContent>
    </Card>
  )
}
