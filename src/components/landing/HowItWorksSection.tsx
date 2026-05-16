"use client"

import { motion } from "framer-motion"
import { UserPlus, BookOpen, Play, Trophy } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Реєстрація",
    desc: "Створіть акаунт як студент або викладач за декілька секунд",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    num: "01",
  },
  {
    icon: BookOpen,
    title: "Курс або урок",
    desc: "Викладач створює курс, студент отримує доступ і бачить матеріали",
    color: "from-purple-500 to-indigo-500",
    bg: "bg-purple-500/10",
    num: "02",
  },
  {
    icon: Play,
    title: "Навчання",
    desc: "Переглядайте відео, читайте матеріали та завантажуйте файли",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    num: "03",
  },
  {
    icon: Trophy,
    title: "Прогрес",
    desc: "Відстежуйте свій прогрес і завершуйте курси успішно",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-500/10",
    num: "04",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold">Як це працює?</h2>
          <p className="mt-4 text-lg text-muted-foreground">Просто, швидко та зручно</p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 hidden lg:block opacity-20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8" style={{ color: step.color.includes("blue") ? "#3b82f6" : step.color.includes("purple") ? "#8b5cf6" : step.color.includes("green") ? "#10b981" : "#f97316" }} />
                    </div>
                    <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${step.color} text-white text-xs font-bold flex items-center justify-center`}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
