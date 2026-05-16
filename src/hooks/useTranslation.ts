"use client"

import { useCallback } from "react"
import { translations, type Locale } from "@/i18n/translations"
import { useLocaleStore } from "@/lib/store"

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  const t = translations[locale as Locale] ?? translations.uk

  const get = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (path: string): string => {
      const keys = path.split(".")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = t
      for (const key of keys) {
        if (current === undefined) return path
        current = current[key]
      }
      return typeof current === "string" ? current : path
    },
    [t]
  )

  return { t, locale, get }
}
