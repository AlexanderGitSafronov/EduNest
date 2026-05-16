"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"

export function OnboardingTour() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return
    const seen = Cookies.get("edunest-tour-done")
    if (seen) return

    let driver: ReturnType<typeof import("driver.js").driver> | null = null

    import("driver.js").then(({ driver: driverFn }) => {
      import("driver.js/dist/driver.css")

      const isTeacher = (session.user as { role?: string })?.role === "TEACHER"

      const steps = isTeacher
        ? [
            {
              element: "#create-course-btn",
              popover: {
                title: "Створіть свій перший курс",
                description: "Натисніть тут, щоб створити новий курс для студентів. Додайте назву та опис.",
                side: "bottom" as const,
                align: "start" as const,
              },
            },
            {
              popover: {
                title: "Додайте модулі та уроки",
                description: "Після створення курсу ви зможете додавати модулі та уроки з відео, текстом і файлами.",
              },
            },
            {
              popover: {
                title: "Надайте доступ студентам",
                description: "Запросіть студентів за email — вони отримають сповіщення та доступ до курсу.",
              },
            },
            {
              popover: {
                title: "Відстежуйте прогрес",
                description: "Слідкуйте за активністю студентів та їх прогресом у кожному курсі.",
              },
            },
          ]
        : [
            {
              popover: {
                title: "Ласкаво просимо до EduNest! 🎓",
                description: "Тут ви знайдете всі курси, до яких вам надав доступ викладач.",
              },
            },
            {
              popover: {
                title: "Ваш прогрес",
                description: "Відстежуйте свій прогрес по кожному курсу. Завершуйте уроки та слідкуйте за статистикою.",
              },
            },
            {
              popover: {
                title: "Перегляд уроків",
                description: "Відкривайте уроки, переглядайте відео, читайте матеріали та завантажуйте файли.",
              },
            },
            {
              popover: {
                title: "Встановіть додаток",
                description: "EduNest — PWA додаток! Встановіть його на свій телефон для зручного навчання без браузера.",
              },
            },
          ]

      driver = driverFn({
        showProgress: true,
        animate: true,
        overlayColor: "rgba(0,0,0,0.7)",
        progressText: "{{current}} / {{total}}",
        nextBtnText: "Далі →",
        prevBtnText: "← Назад",
        doneBtnText: "Розпочати!",
        onDestroyStarted: () => {
          Cookies.set("edunest-tour-done", "1", { expires: 365 })
          driver?.destroy()
        },
        steps,
      })

      // Small delay to let page render
      setTimeout(() => driver?.drive(), 1000)
    })

    return () => {
      driver?.destroy()
    }
  }, [session])

  return null
}
