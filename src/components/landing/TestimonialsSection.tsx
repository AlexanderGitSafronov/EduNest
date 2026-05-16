"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Олена Коваленко",
    role: "Frontend-розробник",
    avatar: "ОК",
    text: "EduNest — найкраща платформа для навчання. AI-асистент допоміг мені зрозуміти складні теми з React, а сертифікат вже в моєму LinkedIn!",
    rating: 5,
    course: "React від A до Z",
    gradient: "from-blue-500 to-cyan-500",
    emoji: "⚛️",
  },
  {
    name: "Дмитро Шевченко",
    role: "Викладач Python",
    avatar: "ДШ",
    text: "Як викладач, дуже ціную аналітику — бачу де студенти зупиняються і можу покращити уроки. Drip-контент — просто мрія викладача!",
    rating: 5,
    course: "Python & Machine Learning",
    gradient: "from-green-500 to-emerald-500",
    emoji: "🐍",
  },
  {
    name: "Марія Бондаренко",
    role: "UX Designer",
    avatar: "МБ",
    text: "Зручний інтерфейс, квізи після кожного уроку і PWA — навчаюся навіть у транспорті. Стрік у 30 днів і бейдж вже мій!",
    rating: 5,
    course: "UI/UX Design Mastery",
    gradient: "from-purple-500 to-pink-500",
    emoji: "🎨",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-25" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"
          >
            Відгуки
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-2">Що кажуть наші користувачі</h2>
          <p className="mt-4 text-lg text-muted-foreground">Реальні відгуки студентів та викладачів</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative rounded-2xl border bg-card p-7 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group overflow-hidden"
            >
              {/* Top gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.gradient} rounded-t-2xl`} />

              {/* Quote icon */}
              <div className="absolute top-5 right-5 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="h-16 w-16" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + j * 0.06 }}
                  >
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Course tag */}
              <div className="flex items-center gap-1.5 mb-5 text-xs text-muted-foreground/70">
                <span>{t.emoji}</span>
                <span>{t.course}</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
