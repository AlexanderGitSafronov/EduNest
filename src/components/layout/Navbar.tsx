"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Bell, Sun, Moon, Monitor, Globe, ChevronDown, BookOpen, Clapperboard } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocaleStore, useViewModeStore } from "@/lib/store"

const locales = [
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
]

export function Navbar() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocaleStore()
  const { viewMode, setViewMode } = useViewModeStore()
  const router = useRouter()
  const currentLocale = locales.find((l) => l.code === locale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const role = (session?.user as { role?: string })?.role
  const effectiveView = mounted ? (role === "TEACHER" ? (viewMode ?? "teacher") : "student") : "student"

  const { data: notifData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => fetch("/api/notifications?unread=1").then(r => r.ok ? r.json() : []),
    enabled: !!session,
    refetchInterval: 60000,
  })
  const unreadCount: number = Array.isArray(notifData) ? notifData.filter((n: { read: boolean }) => !n.read).length : 0

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor
  const ThemeIcon = themeIcon

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-300">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduNest</span>
          </Link>

          {/* Mode switcher for teachers */}
          {mounted && role === "TEACHER" && (
            <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
              <button
                onClick={() => { setViewMode("student"); router.push("/dashboard") }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                  effectiveView === "student"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Навчання</span>
              </button>
              <button
                onClick={() => { setViewMode("teacher"); router.push("/dashboard") }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                  effectiveView === "teacher"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clapperboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Студія</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLocale?.flag}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {locales.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={locale === l.code ? "bg-accent" : ""}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {session ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-muted-foreground" asChild>
                  <Link href="/notifications">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={session.user?.image ?? ""} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">{session.user?.name?.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs capitalize mt-1">
                          {role === "TEACHER" ? "Викладач" : "Студент"}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">{t.nav.dashboard}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">{t.nav.profile}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">{t.nav.login}</Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all" asChild>
                  <Link href="/auth/register">{t.nav.register}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
