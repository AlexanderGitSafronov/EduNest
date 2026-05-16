import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { SessionProvider } from "@/components/layout/SessionProvider"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/layout/QueryProvider"
import { CookieConsent } from "@/components/layout/CookieConsent"
import { PWAInstall } from "@/components/layout/PWAInstall"
import { OnboardingTour } from "@/components/layout/OnboardingTour"
import { auth } from "@/lib/auth"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "EduNest — Modern Online Learning Platform",
  description: "A modern PWA for personal online lessons and course management for teachers and students.",
  manifest: "/manifest.json",
  keywords: ["education", "online learning", "courses", "lessons", "PWA"],
  authors: [{ name: "EduNest" }],
  openGraph: {
    title: "EduNest — Modern Online Learning Platform",
    description: "Online lessons and course management for teachers and students.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EduNest" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
              <CookieConsent />
              <PWAInstall />
              <OnboardingTour />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
