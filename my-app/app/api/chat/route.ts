import { NextRequest, NextResponse } from "next/server"
import { serverStore } from "../../../lib/serverStore"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body?.messages ?? []

    const combinedInsights = serverStore.getState().insights || [];

    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 })
    }

    const insightMessages = combinedInsights.map((i: any) => ({
      role: "system",
      content: `User Financial Insight:\n${JSON.stringify(i, null, 2)}`,
    }));

    const contextMessages = [
      { role: "system", content: "You are a helpful financial assistant. Be concise and actionable. If asked for advice, include a short next-step. Use information from User Financial Insight for context" },
      ...insightMessages,
      ...messages,
    ]

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: contextMessages.map((m: any) => ({ role: m.role, content: m.content })),
      temperature: 0.6,
    }

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: text }, { status: resp.status })
    }
    const data = await resp.json()
    const reply = data?.choices?.[0]?.message?.content ?? ""
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
