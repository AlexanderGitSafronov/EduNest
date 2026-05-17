"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { GraduationCap, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTranslation } from "@/hooks/useTranslation"

const schema = z.object({
  name: z.string().min(2, "Мінімум 2 символи"),
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Мінімум 6 символів"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

function RegisterForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      if (!res.ok) {
        const err = await res.json()
        const msg = typeof err.error === "string" ? err.error : "Помилка реєстрації"
        toast.error(msg)
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-950/30" />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/12 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/12 rounded-full blur-3xl pointer-events-none"
      />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)",
          backgroundSize: "44px 44px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl border bg-card/90 backdrop-blur-2xl shadow-2xl shadow-purple-500/5 p-8 overflow-hidden relative">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-7 relative">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"
              >
                <GraduationCap className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text">EduNest</span>
            </Link>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Створіть акаунт 🚀</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t.auth.hasAccount}{" "}
              <Link href="/auth/login" className="text-indigo-500 font-medium hover:underline underline-offset-4">
                {t.auth.login}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
            {[
              { id: "name", label: t.auth.name, placeholder: "Іван Петренко", icon: User, type: "text", field: "name" as const, delay: 0.12 },
              { id: "email", label: t.auth.email, placeholder: "you@example.com", icon: Mail, type: "email", field: "email" as const, delay: 0.18 },
            ].map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: f.delay }}
                  className="space-y-1.5"
                >
                  <Label htmlFor={f.id} className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{f.label}</Label>
                  <div className="relative group">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      className="pl-10 h-11 rounded-xl border-border/50 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all"
                      {...register(f.field)}
                    />
                  </div>
                  {errors[f.field] && <p className="text-xs text-destructive">{errors[f.field]?.message}</p>}
                </motion.div>
              )
            })}

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.24 }}
              className="space-y-1.5"
            >
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.auth.password}</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 rounded-xl border-border/50 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.30 }}
              className="space-y-1.5"
            >
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{t.auth.confirmPassword}</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-xl border-border/50 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="pt-2"
            >
              <Button
                type="submit"
                className="w-full h-11 rounded-xl shadow-lg shadow-indigo-500/25"
                size="lg"
                disabled={loading}
                variant="gradient"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.loading}</>
                ) : t.auth.register}
              </Button>
            </motion.div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Реєстрація безкоштовна • Без кредитної картки
        </p>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
