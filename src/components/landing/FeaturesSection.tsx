"use client"

import { motion } from "framer-motion"
import { Video, TrendingUp, WifiOff, FileText, Smartphone, Shield, MessageSquare, Award } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

const features = [
  { icon: Video, key: "video", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  { icon: TrendingUp, key: "progress", gradient: "from-green-500 to-emerald-500", bg: "bg-green-500/10" },
  { icon: WifiOff, key: "offline", gradient: "from-purple-500 to-indigo-500", bg: "bg-purple-500/10" },
  { icon: FileText, key: "files", gradient: "from-orange-500 to-amber-500", bg: "bg-orange-500/10" },
  { icon: Smartphone, key: "mobile", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
  { icon: Shield, key: "secure", gradient: "from-teal-500 to-cyan-500", bg: "bg-teal-500/10" },
]

export function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold">{t.features.title}</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t.features.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const item = t.features.items[feature.key as keyof typeof t.features.items]
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                  <Icon className={`h-6 w-6 bg-gradient-to-br ${feature.gradient} [&]:text-transparent bg-clip-text`}
                    style={{ color: feature.gradient.includes("blue") ? "#3b82f6" : feature.gradient.includes("green") ? "#10b981" : feature.gradient.includes("purple") ? "#8b5cf6" : feature.gradient.includes("orange") ? "#f97316" : feature.gradient.includes("pink") ? "#ec4899" : "#14b8a6" }}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
