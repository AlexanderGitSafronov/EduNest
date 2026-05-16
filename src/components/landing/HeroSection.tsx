"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, Users, Zap, Brain, GraduationCap, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useRef, useState } from "react"

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const steps = 60
          const increment = end / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count.toLocaleString("uk-UA")}{suffix}</span>
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-indigo-950/30 dark:to-indigo-950/50" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Animated orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/5 w-[600px] h-[600px] bg-indigo-500/12 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-purple-500/12 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-pink-500/8 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 px-4 py-2 text-sm bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15 cursor-default gap-2">
                <motion.span
                  animate={{ rotate: [0, 15, -10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 3 }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
                Новий рівень онлайн-освіти
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
            >
              Навчайся
              <br />
              <span className="gradient-text">без меж</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Платформа з <strong className="text-foreground">AI-асистентом</strong>, квізами, сертифікатами, курсовими треками та розширеною аналітикою — все в одному місці.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="xl" variant="gradient" asChild className="group shadow-xl shadow-indigo-500/20">
                <Link href="/auth/register">
                  Почати безкоштовно
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="group border-border/60">
                <Link href="/auth/register?role=teacher">
                  <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                  Для викладачів
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-14 flex gap-8 justify-center lg:justify-start"
            >
              {[
                { end: 15000, suffix: "+", label: "Студентів", icon: Users, color: "text-blue-500" },
                { end: 500, suffix: "+", label: "Курсів", icon: BookOpen, color: "text-purple-500" },
                { end: 8000, suffix: "+", label: "Уроків", icon: Zap, color: "text-green-500" },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-1.5 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold">
                      <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Right — app mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative rounded-2xl border bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/10 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="h-6 rounded-md bg-muted/80 flex items-center justify-center px-3">
                    <span className="text-xs text-muted-foreground/70">edunest.app/dashboard</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Вітаємо,</p>
                    <p className="font-semibold">Олексій 👋</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1.5 rounded-full text-xs font-semibold"
                  >
                    🔥 14 днів поспіль
                  </motion.div>
                </div>

                {/* Courses */}
                {[
                  { title: "React від A до Z", progress: 75, color: "bg-blue-500", emoji: "⚛️" },
                  { title: "Python & Machine Learning", progress: 42, color: "bg-green-500", emoji: "🐍" },
                  { title: "UI/UX Design Mastery", progress: 90, color: "bg-purple-500", emoji: "🎨" },
                ].map((course, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.12 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-2.5 hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0">
                      {course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{course.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ delay: 1 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                            className={`h-full ${course.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{course.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Quiz result */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-1 flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                >
                  <span className="text-xl">🎯</span>
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">Квіз завершено!</p>
                    <p className="text-xs text-muted-foreground">Результат: 9 з 10 правильних</p>
                  </div>
                  <div className="ml-auto text-xs font-bold text-green-500">90%</div>
                </motion.div>
              </div>
            </div>

            {/* Floating: AI */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="absolute -top-8 -right-10 rounded-2xl border border-purple-500/25 bg-background/95 backdrop-blur-xl shadow-xl p-4 max-w-[185px] animate-float"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold">AI Асистент</span>
              </div>
              <p className="text-xs text-muted-foreground">«Поясни closure у JavaScript»</p>
              <div className="mt-2 flex gap-1">
                {[16, 10, 14].map((w, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-purple-400/40 animate-pulse"
                    style={{ width: w, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating: Certificate */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="absolute -bottom-6 -left-12 rounded-2xl border border-amber-500/25 bg-background/95 backdrop-blur-xl shadow-xl p-4 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Сертифікат!</p>
                  <p className="text-xs text-muted-foreground">UI/UX Design • 100%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        >
          <p className="text-xs text-muted-foreground/40 uppercase tracking-widest">прокрутіть</p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
