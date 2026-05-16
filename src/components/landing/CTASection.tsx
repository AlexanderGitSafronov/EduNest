"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

const particles = [
  { x: 8, y: 15, size: 3, duration: 4.2, delay: 0 },
  { x: 22, y: 72, size: 5, duration: 5.1, delay: 0.5 },
  { x: 35, y: 35, size: 2, duration: 3.8, delay: 1.1 },
  { x: 48, y: 88, size: 4, duration: 6.0, delay: 0.3 },
  { x: 58, y: 20, size: 3, duration: 4.5, delay: 0.8 },
  { x: 67, y: 60, size: 6, duration: 5.5, delay: 0.2 },
  { x: 75, y: 42, size: 2, duration: 3.5, delay: 1.4 },
  { x: 82, y: 80, size: 4, duration: 4.8, delay: 0.6 },
  { x: 90, y: 25, size: 3, duration: 5.2, delay: 0.9 },
  { x: 15, y: 50, size: 5, duration: 4.0, delay: 1.2 },
  { x: 93, y: 55, size: 2, duration: 3.9, delay: 0.4 },
  { x: 42, y: 10, size: 4, duration: 5.8, delay: 0.7 },
]

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />

          {/* Animated shimmer */}
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-25"
            style={{
              background: "linear-gradient(270deg, #4f46e5, #7c3aed, #db2777, #7c3aed, #4f46e5)",
              backgroundSize: "400% 400%",
            }}
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Floating particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{ y: [-12, 12, -12], opacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
            />
          ))}

          {/* Glow orbs */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-white/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-28 -left-28 w-[420px] h-[420px] bg-white/8 rounded-full blur-3xl"
          />

          <div className="relative px-8 py-24 text-center text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-medium mb-8 border border-white/20"
            >
              <Sparkles className="h-4 w-4" />
              Безкоштовно назавжди
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Готові почати навчання?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Приєднуйтесь до 15,000+ студентів та сотень викладачів на EduNest. Реєстрація займає менше хвилини.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="xl"
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold shadow-2xl shadow-black/25 hover:shadow-black/35 hover:scale-[1.02] transition-all duration-200 group"
                asChild
              >
                <Link href="/auth/register">
                  Зареєструватися безкоштовно
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/50 transition-all"
                asChild
              >
                <Link href="/auth/login">Увійти в акаунт</Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/55 text-sm"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Безкоштовна реєстрація
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI-асистент включено
              </span>
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                PWA — встановіть на телефон
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
