import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { Bell, BookOpen, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bell className="h-7 w-7" />
                Сповіщення
              </h1>
              {unread > 0 && (
                <p className="text-sm text-muted-foreground mt-1">{unread} непрочитаних</p>
              )}
            </div>
            {unread > 0 && (
              <Badge variant="secondary" className="gap-1">
                <CheckCheck className="h-3 w-3" />
                {unread} нових
              </Badge>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">Немає сповіщень</p>
              <p className="text-sm text-muted-foreground mt-1">Тут з&apos;являться повідомлення про нові курси та уроки</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-xl border bg-card p-4 flex items-start gap-3 transition-all ${
                    !n.read ? "border-primary/30 bg-primary/5" : "opacity-75"
                  }`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${!n.read ? "bg-primary/10" : "bg-muted"}`}>
                    <BookOpen className={`h-4 w-4 ${!n.read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString("uk-UA", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
