import { Navbar } from "@/components/layout/Navbar"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Політика Cookie — EduNest" }

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Політика Cookie</h1>
            <p className="text-muted-foreground mt-2">Останнє оновлення: 16 травня 2025</p>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Що таке cookie?</h2>
              <p>Cookie — це невеликі текстові файли, що зберігаються у вашому браузері при відвідуванні сайту.
              Вони допомагають нам запам'ятати ваші налаштування та забезпечити коректну роботу платформи.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Типи cookie, що ми використовуємо</h2>
              <div className="space-y-4">
                {[
                  { type: "Необхідні (обов'язкові)", desc: "Забезпечують базову функціональність: авторизацію, сесію, CSRF захист. Без них сайт не працюватиме коректно.", required: true },
                  { type: "Функціональні", desc: "Зберігають ваші налаштування: обрану мову інтерфейсу, тему (світла/темна), стан завершення туру.", required: true },
                  { type: "Аналітичні (опціональні)", desc: "Допомагають нам розуміти, як користувачі взаємодіють з платформою. Збираються лише за вашою згодою.", required: false },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-foreground">{item.type}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.required ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {item.required ? "Обов'язкові" : "Опціональні"}
                      </span>
                    </div>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Управління cookie</h2>
              <p>Ви можете керувати cookie через налаштування браузера або відкликати свою згоду,
              очистивши cookie сайту. Зверніть увагу, що деактивація необхідних cookie може вплинути на
              функціональність платформи.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Терміни зберігання</h2>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Сесійні cookie: видаляються при закритті браузера</li>
                <li>Постійні cookie (мова, тема): до 1 року</li>
                <li>Cookie згоди: 1 рік</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <GraduationCap className="h-4 w-4" />
              Повернутись на EduNest
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
