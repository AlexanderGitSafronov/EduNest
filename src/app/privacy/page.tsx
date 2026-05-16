import { Navbar } from "@/components/layout/Navbar"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Політика конфіденційності — EduNest",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Політика конфіденційності</h1>
            <p className="text-muted-foreground mt-2">Останнє оновлення: 16 травня 2025</p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Загальні положення</h2>
              <p>
                EduNest ("ми", "нас", "наш") поважає вашу конфіденційність і зобов'язується захищати ваші персональні дані.
                Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо та захищаємо вашу інформацію відповідно
                до вимог Загального регламенту захисту даних (GDPR) та інших застосовних законів.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Які дані ми збираємо</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ім'я та електронна адреса (під час реєстрації)</li>
                <li>Зашифрований пароль (ніколи не зберігається у відкритому вигляді)</li>
                <li>Дані про прогрес навчання (переглянуті уроки, завершені курси)</li>
                <li>Технічні дані (IP-адреса, тип браузера, файли cookie сесії)</li>
                <li>Завантажені файли та відеоматеріали (зберігаються в Cloudinary)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Як ми використовуємо ваші дані</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Надання доступу до платформи та функцій</li>
                <li>Відстеження навчального прогресу</li>
                <li>Відправлення сповіщень про нові уроки та доступ</li>
                <li>Покращення якості сервісу</li>
                <li>Дотримання юридичних вимог</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Зберігання даних</h2>
              <p>
                Ваші дані зберігаються в захищеній базі даних PostgreSQL (Neon). Паролі хешуються за допомогою bcrypt.
                Медіафайли зберігаються в Cloudinary з шифруванням. Ми не продаємо та не передаємо ваші дані третім особам
                без вашої згоди, за винятком технічних підрядників, необхідних для роботи сервісу.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Ваші права (GDPR)</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Право на доступ</strong> — ви можете запросити копію своїх даних</li>
                <li><strong className="text-foreground">Право на виправлення</strong> — ви можете змінити свої дані в профілі</li>
                <li><strong className="text-foreground">Право на видалення</strong> — ви можете запросити видалення акаунту</li>
                <li><strong className="text-foreground">Право на портативність</strong> — ви можете отримати свої дані у форматі JSON</li>
                <li><strong className="text-foreground">Право на заперечення</strong> — ви можете відмовитись від маркетингових повідомлень</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Cookie-файли</h2>
              <p>
                Ми використовуємо необхідні cookie для автентифікації сесії та зберігання мовних налаштувань.
                Аналітичні cookie використовуються лише за вашою згодою. Детальніше:{" "}
                <Link href="/cookies" className="text-primary underline">Політика Cookie</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Безпека</h2>
              <p>
                Ми застосовуємо галузеві стандарти безпеки: HTTPS шифрування, bcrypt для паролів, JWT токени,
                захист від CSRF та XSS атак, валідацію вхідних даних за допомогою Zod, обмеження запитів (rate limiting).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Контакт</h2>
              <p>
                З питань конфіденційності звертайтесь: <strong className="text-foreground">privacy@edunest.app</strong>
                <br />
                Ми відповімо протягом 30 днів.
              </p>
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
