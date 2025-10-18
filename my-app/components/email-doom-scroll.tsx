"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Mail, Calendar, DollarSign } from "lucide-react"

// Mock email data
const mockEmails = [
  {
    id: 1,
    subject: "Your Amazon Order Receipt",
    from: "Amazon",
    date: "2025-10-15",
    category: "Shopping",
    amount: 89.99,
    preview: "Thank you for your order! Your package will arrive on Oct 18.",
    color: "hsl(var(--chart-1))",
  },
  {
    id: 2,
    subject: "Netflix Monthly Subscription",
    from: "Netflix",
    date: "2025-10-14",
    category: "Subscriptions",
    amount: 15.99,
    preview: "Your Netflix subscription has been renewed for another month.",
    color: "hsl(var(--chart-2))",
  },
  {
    id: 3,
    subject: "Electricity Bill - October",
    from: "Power Company",
    date: "2025-10-13",
    category: "Bills",
    amount: 124.5,
    preview: "Your electricity bill for October is ready. Payment due by Oct 25.",
    color: "hsl(var(--chart-3))",
  },
  {
    id: 4,
    subject: "Uber Receipt",
    from: "Uber",
    date: "2025-10-12",
    category: "Travel",
    amount: 23.45,
    preview: "Thanks for riding with Uber! Here is your trip receipt.",
    color: "hsl(var(--chart-4))",
  },
  {
    id: 5,
    subject: "Starbucks Rewards",
    from: "Starbucks",
    date: "2025-10-11",
    category: "Food",
    amount: 12.75,
    preview: "You earned 25 stars! Your purchase receipt is attached.",
    color: "hsl(var(--chart-5))",
  },
]

export function EmailDoomScroll() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentEmail = mockEmails[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockEmails.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockEmails.length) % mockEmails.length)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Doom Scroll</h2>
        <p className="text-muted-foreground">Swipe through your emails like social media reels</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="relative overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <Badge style={{ backgroundColor: currentEmail.color, color: "white" }}>{currentEmail.category}</Badge>
          </div>

          <CardContent className="p-0">
            <div className="min-h-[600px] flex flex-col">
              {/* Email Header */}
              <div className="p-6 border-b border-border bg-card">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${currentEmail.color}20` }}
                  >
                    <Mail className="w-6 h-6" style={{ color: currentEmail.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-balance">{currentEmail.subject}</h3>
                    <p className="text-sm text-muted-foreground">{currentEmail.from}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {currentEmail.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />${currentEmail.amount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 p-6 bg-muted/30">
                <div className="prose prose-sm max-w-none">
                  <p className="text-base leading-relaxed">{currentEmail.preview}</p>
                  <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${currentEmail.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{currentEmail.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{currentEmail.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-border bg-card">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="lg" onClick={handlePrevious} className="gap-2 bg-transparent">
                    <ChevronUp className="w-5 h-5" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {mockEmails.length}
                  </div>

                  <Button variant="default" size="lg" onClick={handleNext} className="gap-2">
                    Next
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
