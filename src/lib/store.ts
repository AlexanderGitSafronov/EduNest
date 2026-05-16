import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LocaleStore {
  locale: string
  setLocale: (locale: string) => void
}

interface ViewModeStore {
  viewMode: "student" | "teacher" | null
  setViewMode: (mode: "student" | "teacher") => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "uk",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "edunest-locale" }
  )
)

export const useViewModeStore = create<ViewModeStore>()(
  persist(
    (set) => ({
      viewMode: null,
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    { name: "edunest-viewmode" }
  )
)
