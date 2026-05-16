"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff, BookOpen, Users } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"

const schema = z.object({
  name: z.string().min(2, "Мінімум 2 символи"),
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Мінімум 6 символів"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "TEACHER"]),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

const roles = [
  { value: "STUDENT", labelKey: "asStudent", icon: Users, desc: "Навчатися та переглядати курси" },
  { value: "TEACHER", labelKey: "asTeacher", icon: BookOpen, desc: "Створювати курси та керувати студентами" },
]

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "teacher" ? "TEACHER" : "STUDENT"
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, role: data.role }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Помилка реєстрації")
        return
      }

      toast.success(t.auth.registerSuccess)

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push("/dashboard")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">EduNest</span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold">{t.auth.register}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.auth.hasAccount}{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                {t.auth.login}
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <Label className="text-sm mb-3 block">{t.auth.role}</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue("role", role.value as "STUDENT" | "TEACHER")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      selectedRole === role.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", selectedRole === role.value ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{t.auth[role.labelKey as keyof typeof t.auth]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.auth.name}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Іван Петренко" className="pl-9" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-9" {...register("confirmPassword")} />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading} variant="gradient">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.loading}</>
              ) : t.auth.register}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
