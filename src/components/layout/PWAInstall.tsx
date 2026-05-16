"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    if (localStorage.getItem("edunest-pwa-dismissed")) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setVisible(true), 5000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setInstalled(true))

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") setInstalled(true)
    setVisible(false)
  }

  if (installed || !visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-20 right-4 z-50 max-w-xs"
      >
        <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl p-4">
          <button onClick={() => { localStorage.setItem("edunest-pwa-dismissed", "1"); setVisible(false) }} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Встановити EduNest</p>
              <p className="text-xs text-muted-foreground mt-0.5">Навчайтесь офлайн з нашим додатком</p>
            </div>
          </div>
          <Button size="sm" variant="gradient" onClick={install} className="w-full text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Встановити додаток
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
