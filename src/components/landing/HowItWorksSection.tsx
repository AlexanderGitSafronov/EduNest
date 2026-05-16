"use client"

import { motion } from "framer-motion"

const steps = [
  {
    emoji: "👤",
    title: "Реєстрація",
    desc: "Створіть акаунт як студент або викладач за кілька секунд — без кредитної картки",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/25",
  },
  {
    emoji: "📚",
    title: "Отримайте доступ",
    desc: "Викладач запрошує студентів за email або публікує курс для вільного запису",
    color: "from-purple-500 to-indigo-500",
    shadow: "shadow-purple-500/25",
  },
  {
    emoji: "🎯",
    title: "Навчайтесь",
    desc: "Відео, квізи, AI-асистент, нотатки, домашні завдання — все в одному місці",
    color: "from-green-500 to-emerald-500",
    shadow: "shadow-green-500/25",
  },
  {
    emoji: "🏆",
    title: "Отримайте сертифікат",
    desc: "Завершіть курс на 100% і отримайте офіційний сертифікат, готовий до друку",
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/25",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-28 bg-muted/20 relative overflow-hidden">
      {/* Subtle bg decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"
          >
            Як це працює
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-2">4 кроки до успіху</h2>
          <p className="mt-4 text-lg text-muted-foreground">Просто, швидко та зручно</p>
        </motion.div>

        <div className="relative">
          {/* Animated connecting line */}
          <div className="absolute top-[52px] left-[14%] right-[14%] h-0.5 hidden lg:block rounded-full overflow-hidden bg-border/50">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.4, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.55 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-7">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl ${step.shadow} text-4xl z-10`}
                  >
                    {step.emoji}
                    {/* Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity -z-10 scale-110`} />
                  </motion.div>

                  {/* Step badge */}
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center z-20 shadow-sm">
                    <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
