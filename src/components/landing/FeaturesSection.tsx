"use client"

import { motion } from "framer-motion"
import {
  Video, Brain, HelpCircle, Award, TrendingUp, BookMarked,
  BarChart2, FileText, MessageSquare,
} from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Відеоуроки",
    desc: "Завантажуйте відео через Cloudinary CDN. Швидко, якісно, на будь-якому пристрої.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    color: "#3b82f6",
  },
  {
    icon: Brain,
    title: "AI Асистент",
    desc: "GPT-4o mini відповідає на питання з контексту кожного уроку. Навчайся з розумним помічником.",
    gradient: "from-purple-500 to-indigo-500",
    bg: "bg-purple-500/10",
    color: "#8b5cf6",
  },
  {
    icon: HelpCircle,
    title: "Квізи та тести",
    desc: "Покрокові тести з прогрес-баром та детальним результатом — правильні і неправильні відповіді.",
    gradient: "from-yellow-500 to-amber-500",
    bg: "bg-yellow-500/10",
    color: "#f59e0b",
  },
  {
    icon: Award,
    title: "Сертифікати",
    desc: "Автоматичний сертифікат при 100% завершенні курсу, готовий до друку або PDF.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    color: "#f97316",
  },
  {
    icon: TrendingUp,
    title: "Стрік та досягнення",
    desc: "Щоденний стрік 🔥, 8 типів бейджів та конфеті при завершенні. Навчання — це весело!",
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    color: "#10b981",
  },
  {
    icon: BookMarked,
    title: "Курсові треки",
    desc: "Навчальні шляхи: Junior Dev, Full Stack та ін. Об'єднуйте курси в системні програми.",
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-500/10",
    color: "#6366f1",
  },
  {
    icon: BarChart2,
    title: "Розширена аналітика",
    desc: "Графік drop-off, середній час на урок і прогрес кожного студента для викладача.",
    gradient: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-500/10",
    color: "#06b6d4",
  },
  {
    icon: FileText,
    title: "Домашні завдання",
    desc: "Студенти здають роботи текстом, викладачі перевіряють і виставляють оцінку від 0 до 10.",
    gradient: "from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
    color: "#f43f5e",
  },
  {
    icon: MessageSquare,
    title: "Коментарі та нотатки",
    desc: "Обговорюйте уроки з потоковими відповідями і зберігайте особисті нотатки з автозбереженням.",
    gradient: "from-teal-500 to-green-500",
    bg: "bg-teal-500/10",
    color: "#14b8a6",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/15 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"
          >
            Можливості
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-2">Все що потрібно для навчання</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Від відеоуроків до AI-асистента — повний набір інструментів для студентів і викладачів
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Hover bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-2xl`}
                />

                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>

                {/* Bottom accent */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} translate-y-0.5 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300`}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
