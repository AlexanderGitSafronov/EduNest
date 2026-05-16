"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, LogOut, CheckCircle2, XCircle, Clock, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

interface TeacherRequest {
  id: string
  status: string
  message: string | null
  createdAt: Date | string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: Date | string
  }
}

export function AdminDashboard({ requests }: { requests: TeacherRequest[] }) {
  const router = useRouter()
  const [list, setList] = useState(requests)
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null)
  const [rejectMessage, setRejectMessage] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const pending = list.filter((r) => r.status === "PENDING")
  const history = list.filter((r) => r.status !== "PENDING")

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const handleAction = async (id: string, action: "approve" | "reject", message?: string) => {
    setLoading(id)
    try {
      const res = await fetch("/api/admin/teacher-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, message }),
      })
      if (!res.ok) throw new Error()

      setList((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "APPROVED" : "REJECTED", message: message ?? r.message }
            : r
        )
      )

      toast.success(action === "approve" ? "Заявку схвалено" : "Заявку відхилено")
    } catch {
      toast.error("Помилка. Спробуйте ще раз.")
    } finally {
      setLoading(null)
      setRejectDialog(null)
      setRejectMessage("")
    }
  }

  const statusBadge = (status: string) => {
    if (status === "PENDING") return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Очікує</Badge>
    if (status === "APPROVED") return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Схвалено</Badge>
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Відхилено</Badge>
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            <span className="font-semibold">EduNest Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Вийти
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Всього заявок", value: list.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Очікують", value: pending.length, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Оброблено", value: history.length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-0.5">{s.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending requests */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Заявки на розгляді</h2>
          {pending.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Нових заявок немає
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={req.user.image ?? ""} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                              {req.user.name?.[0]?.toUpperCase() ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{req.user.name ?? "Без імені"}</p>
                            <p className="text-sm text-muted-foreground truncate">{req.user.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Подано: {new Date(req.createdAt).toLocaleDateString("uk-UA")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                            disabled={loading === req.id}
                            onClick={() => setRejectDialog({ id: req.id, name: req.user.name ?? req.user.email })}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Відхилити
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading === req.id}
                            onClick={() => handleAction(req.id, "approve")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Схвалити
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Історія ({history.length})
            </button>
            {showHistory && (
              <div className="space-y-2">
                {history.map((req) => (
                  <Card key={req.id} className="opacity-70">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={req.user.image ?? ""} />
                            <AvatarFallback className="text-xs">{req.user.name?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{req.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{req.user.email}</p>
                            {req.message && <p className="text-xs text-muted-foreground mt-0.5 italic">{req.message}</p>}
                          </div>
                        </div>
                        {statusBadge(req.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(o) => { if (!o) { setRejectDialog(null); setRejectMessage("") } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Відхилити заявку</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Ви відхиляєте заявку від <strong>{rejectDialog?.name}</strong>. Вкажіть причину (необов&apos;язково).
            </p>
            <Textarea
              placeholder="Причина відхилення..."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectMessage("") }}>Скасувати</Button>
            <Button
              variant="destructive"
              disabled={!!loading}
              onClick={() => rejectDialog && handleAction(rejectDialog.id, "reject", rejectMessage || undefined)}
            >
              Відхилити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
