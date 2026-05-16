import { Navbar } from "@/components/layout/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { ForWhoSection } from "@/components/landing/ForWhoSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { TestimonialsSection } from "@/components/landing/TestimonialsSection"
import { CTASection } from "@/components/landing/CTASection"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ForWhoSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <footer className="border-t bg-muted/10 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold gradient-text text-lg">EduNest</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Сучасна освітня платформа з AI-асистентом, квізами та сертифікатами.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Платформа</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/courses" className="hover:text-foreground transition-colors">Курси</Link></li>
                <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Реєстрація</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Увійти</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Панель</Link></li>
              </ul>
            </div>

            {/* Teachers */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Для викладачів</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/auth/register?role=teacher" className="hover:text-foreground transition-colors">Стати викладачем</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Мої курси</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Компанія</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">Про нас</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Конфіденційність</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 EduNest. Всі права захищені.</p>
            <p className="text-sm text-muted-foreground">Зроблено з ❤️ в Україні</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
