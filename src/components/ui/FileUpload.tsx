"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept?: "image" | "video" | "any"
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  label?: string
  className?: string
  maxSizeMB?: number
}

export function FileUpload({
  accept = "image",
  value,
  onChange,
  onClear,
  label,
  className,
  maxSizeMB = 100,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptAttr = accept === "image"
    ? "image/*"
    : accept === "video"
    ? "video/*"
    : "image/*,video/*"

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Файл занадто великий. Максимум ${maxSizeMB}МБ`)
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85))
      }, 500)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      onChange(data.url)
      toast.success("Файл завантажено!")
    } catch {
      toast.error("Помилка завантаження. Спробуйте ще раз.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isVideo = value && (value.includes("/video/") || value.match(/\.(mp4|webm|mov|avi)$/i))

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden bg-muted border">
          {isVideo ? (
            <video src={value} controls className="w-full max-h-48 object-contain bg-black" />
          ) : (
            <img src={value} alt="upload" className="w-full max-h-48 object-cover" />
          )}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-7 w-7 rounded-full"
            onClick={() => { onChange(""); onClear?.() }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
            uploading
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/30"
          )}
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Завантаження... {progress}%</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                {accept === "video"
                  ? <Film className="h-10 w-10 text-muted-foreground/40" />
                  : <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                }
              </div>
              <div>
                <p className="text-sm font-medium">
                  <span className="text-primary">Оберіть файл</span> або перетягніть сюди
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {accept === "image" ? "PNG, JPG, WebP" : accept === "video" ? "MP4, WebM, MOV" : "Зображення або відео"} • До {maxSizeMB}МБ
                </p>
              </div>
              <Button size="sm" variant="outline" type="button" className="gap-2">
                <Upload className="h-3.5 w-3.5" /> Завантажити
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
