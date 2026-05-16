"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Save, Loader2, KeyRound } from "lucide-react"
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
      <main className="flex-1 bg-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-8">Профіль</h1>

            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user?.image ?? ""} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{session.user?.name}</p>
                  <Badge variant="secondary" className="capitalize mt-1">
                    {role === "TEACHER" ? "Викладач" : "Студент"}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Ім&apos;я
                  </Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше ім'я" />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input value={session.user?.email ?? ""} readOnly className="opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Email не можна змінити</p>
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Роль
                  </Label>
                  <Input value={role === "TEACHER" ? "Викладач" : "Студент"} readOnly className="opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <div className="border-t pt-6 flex items-center justify-between">
                <Button variant="outline" className="gap-2" disabled>
                  <KeyRound className="h-4 w-4" />
                  Змінити пароль
                </Button>
                <Button variant="gradient" onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Зберегти
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
