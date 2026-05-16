"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/useTranslation"

export function CTASection() {
  const { t } = useTranslation()

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
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
          />

          {/* Glow orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

          <div className="relative px-8 py-20 text-center text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-8"
            >
              <Sparkles className="h-4 w-4" />
              EduNest PWA
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{t.cta.title}</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">{t.cta.subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold shadow-lg hover:shadow-2xl transition-all group"
                asChild
              >
                <Link href="/auth/register">
                  {t.cta.button}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur"
                asChild
              >
                <Link href="/auth/login">{t.nav.login}</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">✓ Безкоштовна реєстрація</span>
              <span className="flex items-center gap-1.5">✓ Без кредитної картки</span>
              <span className="flex items-center gap-1.5">✓ PWA — встановіть на телефон</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
