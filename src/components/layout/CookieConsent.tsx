"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Cookies from "js-cookie"
import { Cookie, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = Cookies.get("edunest-cookie-consent")
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    Cookies.set("edunest-cookie-consent", "accepted", { expires: 365, sameSite: "lax" })
    setVisible(false)
  }

  const decline = () => {
    Cookies.set("edunest-cookie-consent", "declined", { expires: 30, sameSite: "lax" })
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
        >
          <div className="rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl p-5">
            <button
              onClick={decline}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Закрити"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Ми використовуємо cookies 🍪</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ми використовуємо необхідні файли cookie для роботи сайту та аналітичні для покращення сервісу.
                  Перегляньте нашу{" "}
                  <Link href="/privacy" className="text-primary underline underline-offset-2">
                    Політику конфіденційності
                  </Link>{" "}
                  та{" "}
                  <Link href="/cookies" className="text-primary underline underline-offset-2">
                    Політику Cookie
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="gradient"
                onClick={accept}
                className="flex-1 text-xs"
              >
                Прийняти всі
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={decline}
                className="text-xs"
              >
                Тільки необхідні
              </Button>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">
                GDPR & CCPA сумісно. Ваші дані захищені.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
