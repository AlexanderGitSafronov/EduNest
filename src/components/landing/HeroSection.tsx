"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, BookOpen, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/useTranslation"

const stats = [
  { key: "students", value: "12K+", icon: Users },
  { key: "courses", value: "340+", icon: BookOpen },
  { key: "lessons", value: "5K+", icon: Zap },
]

const floatingCards = [
  { label: "Python для початківців", progress: 68, color: "from-blue-500 to-cyan-500", top: "10%", right: "-5%" },
  { label: "UI/UX Design", progress: 45, color: "from-purple-500 to-pink-500", bottom: "20%", left: "-5%" },
]

export function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 bg-grid-slate-100/[0.03] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
                ✨ {t.hero.badge}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              {t.hero.title}
              <br />
              <span className="gradient-text">{t.hero.titleHighlight}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="xl" variant="gradient" asChild className="group">
                <Link href="/auth/register">
                  {t.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="group">
                <Link href="/auth/register?role=teacher">
                  <Play className="mr-2 h-5 w-5 text-indigo-500" />
                  {t.hero.ctaSecondary}
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-14 flex gap-8 justify-center lg:justify-start"
            >
              {stats.map((stat, i) => (
                <div key={stat.key} className="text-center lg:text-left">
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.hero.stats[stat.key as keyof typeof t.hero.stats]}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Main dashboard card */}
            <div className="relative rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl p-6 glow-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 h-7 rounded-md bg-muted animate-pulse" />
              </div>

              {/* Course list */}
              {[
                { title: "React від A до Z", lessons: 24, progress: 75, color: "bg-blue-500" },
                { title: "Python & Machine Learning", lessons: 18, progress: 40, color: "bg-green-500" },
                { title: "UI/UX Design Mastery", lessons: 30, progress: 90, color: "bg-purple-500" },
              ].map((course, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 mb-3 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg ${course.color} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                    {course.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.lessons} уроків</p>
                    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                        className={`h-full ${course.color} rounded-full`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{course.progress}%</span>
                </motion.div>
              ))}
            </div>

            {/* Floating cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.2 }}
                className="absolute glass rounded-xl p-4 shadow-xl animate-float"
                style={{
                  top: card.top,
                  right: card.right,
                  bottom: card.bottom,
                  left: card.left,
                  animationDelay: `${i * 1}s`,
                }}
              >
                <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${card.color} mb-2`} />
                <p className="text-xs font-medium text-foreground">{card.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.progress}% завершено</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
