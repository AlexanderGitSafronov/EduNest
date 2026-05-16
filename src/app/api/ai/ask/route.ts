import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { question, lessonTitle, lessonContent } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: "Empty question" }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant not configured" }, { status: 503 })
  }

  try {
    const systemPrompt = lessonTitle
      ? `You are a helpful educational assistant. The student is currently studying "${lessonTitle}".${lessonContent ? ` Lesson content: ${lessonContent.slice(0, 500)}` : ""} Answer concisely in Ukrainian.`
      : "You are a helpful educational assistant. Answer concisely in Ukrainian."

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      }),
    })

    if (!response.ok) throw new Error("AI API error")
    const data = await response.json()
    const answer = data.content?.[0]?.text ?? "Не вдалося отримати відповідь"
    return NextResponse.json({ answer })
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 })
  }
}
