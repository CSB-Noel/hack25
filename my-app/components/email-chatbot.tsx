"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi! I'm your email assistant. I can help you find emails, analyze spending, or answer questions about your financial data. What would you like to know?",
    timestamp: new Date(),
  },
]

export function EmailChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("spend") || lowerQuery.includes("money")) {
      return "Based on your email receipts, you've spent $2,900 this month. Your top categories are: Food & Dining ($1,240), Shopping ($980), and Bills ($850). Would you like a detailed breakdown?"
    }

    if (lowerQuery.includes("subscription")) {
      return "You have 4 active subscriptions: Netflix ($15.99), Spotify ($9.99), AWS ($42.50), and Adobe Creative Cloud ($54.99). That's $123.47 per month total. Would you like to review any of these?"
    }

    if (lowerQuery.includes("fraud") || lowerQuery.includes("suspicious")) {
      return "I've detected 2 potentially suspicious transactions: A $299.99 charge from 'Unknown Vendor XYZ' and an $89.50 charge from a foreign location. Would you like to review these in detail?"
    }

    if (lowerQuery.includes("save") || lowerQuery.includes("recommend")) {
      return "Here are some recommendations to save money: 1) Reduce dining expenses by 20% to save $248/month, 2) Cancel unused subscriptions to save $84/month, 3) Set up automatic savings transfers. Would you like more details on any of these?"
    }

    return "I can help you with questions about your spending, subscriptions, fraud detection, or financial recommendations. What would you like to know more about?"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Chatbot</h2>
        <p className="text-muted-foreground">Ask questions about your emails and financial data</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>Powered by AI to help you understand your financial data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto space-y-4 p-4 border border-border rounded-lg bg-muted/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }
                    >
                      {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-12"
                        : "bg-card border border-border mr-12"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="flex-shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 p-4 rounded-lg bg-card border border-border mr-12">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your emails or spending..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput("How much did I spend this month?")}>
                Monthly spending
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("What subscriptions do I have?")}>
                My subscriptions
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("Any suspicious transactions?")}>
                Fraud check
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput("How can I save money?")}>
                Savings tips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
