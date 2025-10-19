"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatView() {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: "sys-hello", role: "assistant", content: "Hi! I can help analyze your spending, subscriptions, and goals. Ask me anything about your finances." },
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    const userMsg: Message = { id: String(Date.now()), role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].slice(-8) }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const botMsg: Message = { id: `bot-${Date.now()}`, role: "assistant", content: data.reply }
      setMessages((m) => [...m, botMsg])
    } catch (e: any) {
      const errMsg: Message = { id: `err-${Date.now()}`, role: "assistant", content: "Sorry, I couldn't process that. Please try again." }
      setMessages((m) => [...m, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="px-4 max-w-md mx-auto pb-24">
      <h2 className="text-xl font-semibold text-foreground mb-3">Finance Chat</h2>
      <Card className="p-3 h-[60vh] overflow-y-auto mb-3 space-y-3 bg-card border-border">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-foreground"}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </Card>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Ask about subscriptions, budgeting, or goals…" />
        <Button onClick={sendMessage} disabled={loading}>Send</Button>
      </div>
    </div>
  )
}
