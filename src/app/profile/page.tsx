"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Save, Loader2, KeyRound, Camera, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (session?.user?.name) setName(session.user.name)
  }, [session, status, router])

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const role = (session.user as { role?: string })?.role

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success("Профіль оновлено")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/10">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-8">Профіль</h1>

            <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
              {/* Gradient banner */}
              <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 overflow-hidden">
                <motion.div
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: "linear-gradient(270deg, #4f46e5, #7c3aed, #db2777, #7c3aed, #4f46e5)",
                    backgroundSize: "400% 400%",
                  }}
                />
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-white/70 bg-white/10 backdrop-blur rounded-full px-3 py-1">
                  <Sparkles className="h-3 w-3" />
                  {role === "TEACHER" ? "Викладач EduNest" : "Студент"}
                </div>
              </div>

              <div className="px-6 pb-6">
                {/* Avatar overlapping banner */}
                <div className="flex items-end gap-4 -mt-12 mb-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-card shadow-xl">
                      <AvatarImage src={session.user?.image ?? ""} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-background border-2 border-card shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      title="Завантажити аватар (скоро)"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mb-1">
                    <p className="text-xl font-semibold leading-tight">{session.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>

                {/* Info chips row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</p>
                      <p className="text-xs font-medium truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Shield className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Роль</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs h-5 px-2">
                          {role === "TEACHER" ? "Викладач" : "Студент"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable section */}
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-1.5 pt-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Ім&apos;я
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше ім'я"
                      className="h-11 rounded-xl border-border/50 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40"
                    />
                  </div>
                </div>

                <div className="border-t mt-6 pt-6 flex items-center justify-between">
                  <Button variant="outline" className="gap-2 rounded-xl" disabled>
                    <KeyRound className="h-4 w-4" />
                    Змінити пароль
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">Soon</Badge>
                  </Button>
                  <Button variant="gradient" onClick={handleSave} disabled={saving} className="gap-2 rounded-xl shadow-lg shadow-indigo-500/20">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Зберегти
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
