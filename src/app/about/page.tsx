"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"
import {
  GraduationCap, ArrowRight, Zap, Shield, Globe, Smartphone, BookOpen,
  TrendingUp, Users, Video, Star, CheckCircle2, Sparkles, Code2, Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/Navbar"

const features = [
  { icon: Video, title: "HD Відеоуроки", desc: "Потокове та завантаження відео через Cloudinary CDN", color: "blue" },
  { icon: TrendingUp, title: "Прогрес-трекінг", desc: "Реальний час відстеження по урокам і курсам", color: "green" },
  { icon: Smartphone, title: "PWA Mobile", desc: "Встановлюється як нативний додаток, офлайн доступ", color: "purple" },
  { icon: Globe, title: "Мультимовний", desc: "Повна підтримка Ukrainian, English, Russian", color: "orange" },
  { icon: Shield, title: "Безпечно", desc: "GDPR, bcrypt, JWT, CSP headers, rate limiting", color: "red" },
  { icon: Zap, title: "Миттєво", desc: "Next.js App Router, edge runtime, оптимізація", color: "yellow" },
]

const techStack = [
  { name: "Next.js 15", desc: "App Router + Server Components", color: "from-gray-800 to-gray-600" },
  { name: "PostgreSQL", desc: "Neon — serverless Postgres", color: "from-blue-700 to-blue-500" },
  { name: "Tailwind CSS 4", desc: "Utility-first styling", color: "from-cyan-600 to-sky-500" },
  { name: "Framer Motion", desc: "Smooth animations", color: "from-pink-600 to-purple-500" },
  { name: "NextAuth v5", desc: "Authentication & sessions", color: "from-green-700 to-emerald-500" },
  { name: "Cloudinary", desc: "Media storage & delivery", color: "from-indigo-600 to-violet-500" },
  { name: "Prisma ORM", desc: "Type-safe database access", color: "from-teal-600 to-cyan-500" },
  { name: "shadcn/ui", desc: "Accessible components", color: "from-slate-700 to-slate-500" },
]

const stats = [
  { value: "100+", label: "компонентів UI" },
  { value: "20+", label: "API endpoints" },
  { value: "3", label: "мови інтерфейсу" },
  { value: "PWA", label: "офлайн-режим" },
]

const testimonials = [
  { name: "Марія К.", role: "Викладач математики", text: "EduNest зробив мою роботу набагато простішою. Можу легко додавати відеоуроки і відстежувати прогрес кожного учня.", avatar: "М" },
  { name: "Сергій Л.", role: "Студент", text: "Нарешті платформа, яка виглядає сучасно і швидко працює! Можу навчатись навіть без інтернету.", avatar: "С" },
  { name: "Олена В.", role: "Репетитор англійської", text: "Функція надання доступу конкретним студентам — ідеальна для приватних уроків. Рекомендую!", avatar: "О" },
]

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-indigo-400/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center"
        >
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl glow-primary mb-8 mx-auto animate-float">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Badge className="mb-6 px-5 py-2 text-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Проект EduNest — Modern Education Platform
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
              Освіта нового{" "}
              <span className="gradient-text">покоління</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              EduNest — це повнофункціональна PWA платформа для онлайн-навчання, побудована на найсучасніших
              технологіях. Від викладача до студента — без меж, без компромісів.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Button size="xl" variant="gradient" asChild>
              <Link href="/auth/register">
                Спробувати безкоштовно <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/">На головну</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center glass rounded-2xl p-4">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold">Що всередині?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Повний набір інструментів для сучасного навчання</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              const colorMap: Record<string, string> = {
                blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                green: "bg-green-500/10 text-green-500 border-green-500/20",
                purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                red: "bg-red-500/10 text-red-500 border-red-500/20",
                yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
              }
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border p-6 bg-card hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`inline-flex p-3 rounded-xl border mb-4 ${colorMap[f.color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Code2 className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-bold">Технологічний стек</h2>
            <p className="mt-4 text-lg text-muted-foreground">Найкращі інструменти для найкращого результату</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl overflow-hidden group cursor-default"
              >
                <div className={`h-2 bg-gradient-to-r ${tech.color}`} />
                <div className="p-4 bg-card border border-t-0 rounded-b-2xl">
                  <p className="font-bold text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher vs Student split */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold">Для кожної ролі</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                role: "Викладач",
                icon: BookOpen,
                gradient: "from-indigo-500 to-purple-600",
                features: [
                  "Створення курсів, модулів та уроків",
                  "Завантаження відео через Cloudinary",
                  "Управління доступом студентів",
                  "Перегляд прогресу кожного студента",
                  "Публікація та зняття курсів",
                  "Сповіщення студентів про нові уроки",
                ],
              },
              {
                role: "Студент",
                icon: Users,
                gradient: "from-pink-500 to-rose-500",
                features: [
                  "Доступ до призначених курсів",
                  "Перегляд відеоуроків (YouTube, Vimeo, пряме відео)",
                  "Завантаження файлів і матеріалів",
                  "Відстеження прогресу по курсу",
                  "Нотатки до уроків",
                  "Сповіщення про нові матеріали",
                ],
              },
            ].map((role, i) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border bg-card overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${role.gradient} p-8 text-white`}>
                    <Icon className="h-10 w-10 mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold">{role.role}</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {role.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold">Що кажуть користувачі</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)"
            }} />
            <div className="relative px-8 py-20 text-white">
              <Layers className="h-12 w-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Готові почати?</h2>
              <p className="text-xl text-white/80 max-w-xl mx-auto mb-10">
                EduNest — ваша платформа для сучасного онлайн-навчання. Реєстрація займає 30 секунд.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-white/90 font-semibold" asChild>
                  <Link href="/auth/register">
                    Створити акаунт <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link href="/">На головну</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
          <GraduationCap className="h-4 w-4" />
          EduNest © 2025
        </Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="hover:text-foreground">Конфіденційність</Link>
        <span className="mx-3">·</span>
        <Link href="/cookies" className="hover:text-foreground">Cookie</Link>
      </footer>
    </div>
  )
}
