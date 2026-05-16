"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const studentBenefits = [
  "Відеоуроки та PDF-матеріали",
  "AI-асистент для питань по уроку",
  "Квізи для перевірки знань",
  "Сертифікат при 100% завершенні",
  "Щоденний стрік та бейджі",
  "Нотатки та коментарі до уроків",
]

const teacherBenefits = [
  "Конструктор курсів і модулів",
  "Drip-контент: розклад відкриття уроків",
  "Домашні завдання з оцінюванням",
  "Аналітика: drop-off та час на урок",
  "Курсові навчальні треки",
  "Завантаження відео та файлів",
]

export function ForWhoSection() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            Для кого
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-2">EduNest — для кожного</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Чи ви студент що хоче вчитися, чи викладач що ділиться знаннями
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {[
            {
              emoji: "🎓",
              role: "Студент",
              subtitle: "Навчайся ефективніше",
              benefits: studentBenefits,
              gradient: "from-blue-500 to-indigo-500",
              bgGradient: "from-blue-500/5 via-indigo-500/5 to-transparent",
              border: "border-blue-500/20",
              glow: "bg-blue-500",
              href: "/auth/register",
              cta: "Почати навчання",
            },
            {
              emoji: "👨‍🏫",
              role: "Викладач",
              subtitle: "Поділися своїми знаннями",
              benefits: teacherBenefits,
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-500/5 via-pink-500/5 to-transparent",
              border: "border-purple-500/20",
              glow: "bg-purple-500",
              href: "/auth/register?role=teacher",
              cta: "Стати викладачем",
            },
          ].map((side, i) => (
            <motion.div
              key={side.role}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl border ${side.border} bg-gradient-to-br ${side.bgGradient} p-8 overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-shadow duration-500`}
            >
              {/* Decorative orb */}
              <div className={`absolute -top-16 -right-16 w-48 h-48 ${side.glow} opacity-[0.06] rounded-full blur-2xl group-hover:opacity-[0.1] transition-opacity duration-500`} />

              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
                className="text-5xl mb-5 inline-block"
              >
                {side.emoji}
              </motion.div>

              <h3 className="text-2xl font-bold mb-1">{side.role}</h3>
              <p className="text-muted-foreground mb-7 text-sm">{side.subtitle}</p>

              <ul className="space-y-3 mb-8">
                {side.benefits.map((benefit, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + j * 0.06 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-gradient-to-br ${side.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <Button variant="gradient" asChild className="w-full shadow-lg">
                <Link href={side.href}>{side.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
