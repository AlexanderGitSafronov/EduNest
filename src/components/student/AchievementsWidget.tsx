"use client"

import { useQuery } from "@tanstack/react-query"
import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

export function AchievementsWidget() {
  const { data, isLoading } = useQuery<{
    achievements: Achievement[]
    earnedCount: number
    totalCount: number
  }>({
    queryKey: ["achievements"],
    queryFn: () => fetch("/api/user/achievements").then((r) => r.json()),
  })

  if (isLoading) return <Skeleton className="h-32 rounded-2xl" />
  if (!data || data.totalCount === 0) return null

  const { achievements, earnedCount, totalCount } = data

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Досягнення
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {earnedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {achievements.map((ach) => (
              <Tooltip key={ach.id}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl cursor-default transition-all",
                    ach.earned
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "bg-muted/30 opacity-40 grayscale"
                  )}>
                    <span className="text-xl">{ach.icon}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{ach.title}</p>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  {ach.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ach.earnedAt).toLocaleDateString("uk-UA")}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
