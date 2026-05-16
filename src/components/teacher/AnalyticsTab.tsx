"use client"

import { useQuery } from "@tanstack/react-query"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from "recharts"
import { Users, Trophy, TrendingDown, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LessonStat {
  id: string
  title: string
  type: string
  position: number
  completionRate: number
  completedCount: number
  startedCount: number
  dropOff: number
  avgWatchedMins: number
  expectedDurationMins: number | null
}

interface AnalyticsData {
  lessons: LessonStat[]
  totalStudents: number
  completionRate: number
  completedCount: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded-lg shadow-lg px-3 py-2.5 text-sm">
      <p className="font-medium mb-1.5 max-w-[180px] truncate">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value}{p.name.includes("%") || p.name === "Проходження" ? "%" : p.name.includes("хв") ? " хв" : ""}</span>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsTab({ courseId }: { courseId: string }) {
  const { data, isLoading, isError, refetch } = useQuery<AnalyticsData>({
    queryKey: ["course-analytics", courseId],
    queryFn: () => fetch(`/api/courses/${courseId}/analytics`).then((r) => r.json()),
  })

  if (isLoading) return (
    <div className="space-y-4 mt-2">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
    </div>
  )

  if (isError || !data) return (
    <Card className="border-destructive/20 mt-2">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive/50 mb-3" />
        <p className="font-medium mb-4">Не вдалося завантажити аналітику</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Спробувати знову
        </Button>
      </CardContent>
    </Card>
  )

  const { lessons, totalStudents, completionRate, completedCount } = data

  if (totalStudents === 0) return (
    <Card className="border-dashed mt-2">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="font-medium mb-1">Ще немає студентів</p>
        <p className="text-sm text-muted-foreground">Аналітика з'явиться після першого запису</p>
      </CardContent>
    </Card>
  )

  const shortTitle = (t: string) => t.length > 18 ? t.slice(0, 16) + "…" : t

  const dropOffLesson = lessons.reduce((worst, l) => l.dropOff > (worst?.dropOff ?? 0) ? l : worst, lessons[0])

  return (
    <div className="space-y-5 mt-2">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Студентів", value: totalStudents, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Завершили курс", value: completedCount, icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Відсоток завершення", value: `${completionRate}%`, icon: TrendingDown, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Уроків", value: lessons.length, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-2xl font-bold mt-0.5", s.color)}>{s.value}</p>
                </div>
                <div className={cn("p-2 rounded-lg", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drop-off alert */}
      {dropOffLesson && dropOffLesson.dropOff > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingDown className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">Найбільший відсів після уроку {dropOffLesson.position}</p>
              <p className="text-xs text-muted-foreground">«{dropOffLesson.title}» — {dropOffLesson.dropOff} студент(ів) зупинились</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion rate per lesson */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Проходження по уроках (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lessons} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="title" tickFormatter={shortTitle} tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completionRate" name="Проходження" radius={[4, 4, 0, 0]}>
                {lessons.map((l) => (
                  <Cell
                    key={l.id}
                    fill={l.completionRate >= 70 ? "#22c55e" : l.completionRate >= 40 ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Drop-off chart */}
      {lessons.some((l) => l.dropOff > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Відсів між уроками (кількість студентів)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lessons} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="title" tickFormatter={shortTitle} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completedCount"
                  name="Завершили"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Avg watch time per lesson */}
      {lessons.some((l) => l.avgWatchedMins > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Середній час перегляду (хв)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lessons.filter((l) => l.avgWatchedMins > 0)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="title" tickFormatter={shortTitle} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                {lessons.some((l) => l.expectedDurationMins) && (
                  <ReferenceLine y={lessons.find((l) => l.expectedDurationMins)?.expectedDurationMins ?? 0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "очікувано", fontSize: 10, fill: "#f59e0b" }} />
                )}
                <Bar dataKey="avgWatchedMins" name="Переглянуто хв" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lesson table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Деталі по уроках</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Урок</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Починали</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Завершили</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">%</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Avg хв</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l, i) => (
                  <tr key={l.id} className={cn("border-b last:border-0", i % 2 === 0 ? "" : "bg-muted/10")}>
                    <td className="px-4 py-2.5 text-muted-foreground">{l.position}</td>
                    <td className="px-4 py-2.5 max-w-[200px] truncate">{l.title}</td>
                    <td className="px-4 py-2.5 text-right">{l.startedCount}</td>
                    <td className="px-4 py-2.5 text-right">{l.completedCount}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={cn("font-medium",
                        l.completionRate >= 70 ? "text-green-500" :
                        l.completionRate >= 40 ? "text-yellow-500" : "text-red-500"
                      )}>{l.completionRate}%</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {l.avgWatchedMins > 0 ? `${l.avgWatchedMins}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
