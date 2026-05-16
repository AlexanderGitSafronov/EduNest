"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Award, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Certificate {
  id: string
  issuedAt: string
  course: { title: string }
  user: { name: string | null }
}

interface Props {
  courseId: string
  courseName: string
  userName: string
  isComplete: boolean
}

function printCertificate(cert: Certificate) {
  const win = window.open("", "_blank")
  if (!win) return
  const date = new Date(cert.issuedAt).toLocaleDateString("uk-UA", {
    day: "numeric", month: "long", year: "numeric",
  })
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Сертифікат — ${cert.course.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f8f7f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .cert { background: white; width: 900px; padding: 60px 80px; border: 3px solid #6366f1; border-radius: 16px; text-align: center; box-shadow: 0 20px 60px rgba(99,102,241,0.15); position: relative; }
        .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #6366f140; border-radius: 10px; pointer-events: none; }
        .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .subtitle { color: #6b7280; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
        .headline { font-family: 'Playfair Display', serif; font-size: 48px; color: #1f2937; margin-bottom: 16px; }
        .recipient { font-family: 'Playfair Display', serif; font-size: 36px; color: #6366f1; margin: 20px 0; font-weight: 700; }
        .text { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 12px; }
        .course { font-weight: 700; color: #1f2937; font-size: 20px; margin: 8px 0 30px; }
        .divider { width: 120px; height: 3px; background: linear-gradient(90deg, #6366f1, #a855f7); margin: 30px auto; border-radius: 2px; }
        .date { color: #9ca3af; font-size: 14px; margin-top: 30px; }
        .seal { font-size: 72px; margin: 20px 0; }
        @media print { body { background: white; } .cert { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="cert">
        <div class="logo">EduNest</div>
        <div class="subtitle">Сучасна освітня платформа</div>
        <div class="seal">🏆</div>
        <div class="headline">Сертифікат про завершення</div>
        <div class="divider"></div>
        <p class="text">Цей сертифікат підтверджує, що</p>
        <div class="recipient">${cert.user.name ?? "Студент"}</div>
        <p class="text">успішно завершив(ла) курс</p>
        <div class="course">«${cert.course.title}»</div>
        <div class="divider"></div>
        <div class="date">Видано ${date}</div>
      </div>
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `)
  win.document.close()
}

export function CertificateSection({ courseId, courseName, userName, isComplete }: Props) {
  const qc = useQueryClient()

  const { data: cert } = useQuery<Certificate | null>({
    queryKey: ["certificate", courseId],
    queryFn: () => fetch(`/api/courses/${courseId}/certificate`).then((r) => r.json()),
    enabled: isComplete,
  })

  const issueMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/certificate`, { method: "POST" })
      if (!res.ok) throw new Error("Failed")
      return res.json() as Promise<Certificate>
    },
    onSuccess: (newCert) => {
      qc.setQueryData(["certificate", courseId], newCert)
      toast.success("Сертифікат видано!")
    },
    onError: () => toast.error("Не вдалося видати сертифікат"),
  })

  if (!isComplete) return null

  return (
    <div className="mt-6 p-5 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-yellow-500/15">
          <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <p className="font-semibold">Курс завершено!</p>
          <p className="text-sm text-muted-foreground">Отримайте сертифікат про проходження</p>
        </div>
      </div>

      {cert ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-yellow-500/40 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10"
          onClick={() => printCertificate(cert)}
        >
          <Download className="h-4 w-4" />
          Завантажити сертифікат
        </Button>
      ) : (
        <Button
          variant="gradient"
          size="sm"
          className="gap-2"
          disabled={issueMutation.isPending}
          onClick={() => issueMutation.mutate()}
        >
          {issueMutation.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Генерую...</>
            : <><Award className="h-4 w-4" /> Отримати сертифікат</>
          }
        </Button>
      )}
    </div>
  )
}
