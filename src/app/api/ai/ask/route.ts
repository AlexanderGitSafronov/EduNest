import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { question, lessonTitle, lessonContent } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: "Empty question" }, { status: 400 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant not configured" }, { status: 503 })
  }

  try {
    const systemPrompt = lessonTitle
      ? `Ти корисний освітній асистент. Студент зараз вивчає тему "${lessonTitle}".${lessonContent ? ` Зміст уроку: ${lessonContent.slice(0, 500)}` : ""} Відповідай стисло та зрозуміло українською мовою.`
      : "Ти корисний освітній асистент. Відповідай стисло та зрозуміло українською мовою."

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message ?? "OpenAI API error")
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content ?? "Не вдалося отримати відповідь"
    return NextResponse.json({ answer })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "AI request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
