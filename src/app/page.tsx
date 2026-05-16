import { Navbar } from "@/components/layout/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
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
        <HowItWorksSection />
        <CTASection />
      </main>
      <footer className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold gradient-text text-lg">EduNest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 EduNest. Сучасна освітня платформа.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Увійти</Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">Реєстрація</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
