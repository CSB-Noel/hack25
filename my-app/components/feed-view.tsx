"use client"

import { useState } from "react"
import { InsightCard } from "@/components/insight-card"
import { BlackholeZone } from "@/components/blackhole-zone"
import { GmailMessageCard } from "@/components/gmail-message-card"
import { useGmailMessages } from "@/lib/hooks/use-gmail"
import { Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample financial insights data
const sampleInsights = [
  {
    id: "1",
    kind: "subscription" as const,
    title: "Spotify price increased",
    merchantOrBill: "Spotify",
    amount: 10.99,
    date: "2025-10-01T10:22:00Z",
    account: "Capital One Savor",
    category: "Entertainment",
    delta30: 1.0,
    delta90: 1.0,
    aiHeader: {
      bullets: [
        "Price up $1.00 vs last month",
        "Duplicate service: also paying Apple Music",
        "Low usage in past 60 days",
      ],
      nextStep: "Keep Spotify, cancel Apple Music?",
      badges: ["priority", "priceUp", "duplicateSub"],
      confidence: 0.91,
    },
  },
  {
    id: "2",
    kind: "bill" as const,
    title: "Electric bill due soon",
    merchantOrBill: "Pacific Gas & Electric",
    amount: 142.5,
    date: "2025-10-15T00:00:00Z",
    account: "Chase Checking",
    category: "Utilities",
    delta30: 12.5,
    delta90: -5.2,
    aiHeader: {
      bullets: ["Due in 3 days", "Up 9.6% from last month", "Balance sufficient to pay"],
      nextStep: "Schedule payment now?",
      badges: ["dueSoon"],
      confidence: 0.95,
    },
  },
  {
    id: "3",
    kind: "anomaly" as const,
    title: "Unusual spending detected",
    merchantOrBill: "Amazon",
    amount: 287.43,
    date: "2025-10-12T14:30:00Z",
    account: "Capital One Savor",
    category: "Shopping",
    delta30: 150.0,
    delta90: 200.0,
    aiHeader: {
      bullets: ["3x your typical Amazon spend", "Multiple charges in one day", "Consider setting a monthly cap"],
      nextStep: "Review charges or set budget alert?",
      badges: ["anomaly"],
      confidence: 0.88,
    },
  },
  {
    id: "4",
    kind: "goal" as const,
    title: "Emergency fund progress",
    merchantOrBill: "Savings Goal",
    amount: 3250.0,
    date: "2025-10-18T00:00:00Z",
    account: "High-Yield Savings",
    category: "Savings",
    delta30: 500.0,
    delta90: 1250.0,
    aiHeader: {
      bullets: ["65% to your $5,000 target", "On track to reach goal in 4 months", "Found $150 excess in checking"],
      nextStep: "Sweep excess to savings?",
      badges: [],
      confidence: 0.92,
    },
  },
  {
    id: "5",
    kind: "advice" as const,
    title: "Subscription optimization",
    merchantOrBill: "Multiple Services",
    amount: 89.97,
    date: "2025-10-18T00:00:00Z",
    account: "Multiple Accounts",
    category: "Subscriptions",
    delta30: 0,
    delta90: 0,
    aiHeader: {
      bullets: [
        "Paying for 3 streaming services",
        "Could save $30/mo with family plan",
        "Netflix, Hulu, Disney+ detected",
      ],
      nextStep: "Switch to bundle plan?",
      badges: ["priority"],
      confidence: 0.87,
    },
  },
]

export function FeedView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<'insights' | 'gmail'>('insights')
  
  const { messages: gmailMessages, loading: gmailLoading, error: gmailError } = useGmailMessages(20)

  const handleNext = () => {
    if (activeTab === 'insights') {
      if (currentIndex < sampleInsights.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    } else {
      if (currentIndex < gmailMessages.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleBlackhole = (id: string) => {
    console.log("[v0] Blackhole action for insight:", id)
    // Move to next card after deletion
    if (activeTab === 'insights' && currentIndex < sampleInsights.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (activeTab === 'gmail' && currentIndex < gmailMessages.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const currentItems = activeTab === 'insights' ? sampleInsights : gmailMessages

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4 px-4">
        <Button
          variant={activeTab === 'insights' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveTab('insights')
            setCurrentIndex(0)
          }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Insights
        </Button>
        <Button
          variant={activeTab === 'gmail' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setActiveTab('gmail')
            setCurrentIndex(0)
          }}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Gmail
          {gmailLoading && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
        </Button>
      </div>

      <div className="h-full overflow-hidden">
        {activeTab === 'insights' ? (
          <div
            className="h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateY(-${currentIndex * 100}%)` }}
          >
            {sampleInsights.map((insight, index) => (
              <div key={insight.id} className="h-full snap-start">
                <InsightCard
                  insight={insight}
                  isActive={index === currentIndex}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onBlackhole={handleBlackhole}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-4 space-y-3">
            {gmailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading Gmail messages...</p>
                </div>
              </div>
            ) : gmailError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-destructive mb-2">Error loading Gmail messages</p>
                  <p className="text-sm text-muted-foreground">{gmailError}</p>
                </div>
              </div>
            ) : gmailMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No Gmail messages found</p>
                </div>
              </div>
            ) : (
              gmailMessages.map((message) => (
                <GmailMessageCard
                  key={message.id}
                  message={message}
                  onClick={() => console.log('Open message:', message.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Pagination dots - only show for insights */}
      {activeTab === 'insights' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {sampleInsights.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      <BlackholeZone isActive={isDragging} />
    </div>
  )
}
