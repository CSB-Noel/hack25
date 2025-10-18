"use client"

import { useState } from "react"
import { EmailCard } from "@/components/email-card"
import { BlackholeZone } from "@/components/blackhole-zone"

interface InboxFeedProps {
  onCompose: () => void
}

// Mock email data
const mockEmails = [
  {
    id: "1",
    from: "Sarah Chen",
    subject: "Q4 Product Roadmap Review",
    preview: "Hi team, I wanted to share the updated roadmap for Q4. We have some exciting features planned...",
    receivedAt: "2h ago",
    keyPoints: [
      "Q4 roadmap includes 3 major feature releases",
      "Need feedback on timeline by Friday",
      "Budget approval required for new hires",
    ],
    badges: ["priority", "project"],
    starred: false,
    attachments: 2,
  },
  {
    id: "2",
    from: "Marcus Johnson",
    subject: "Design System Updates",
    preview: "The new component library is ready for review. I have updated all the documentation...",
    receivedAt: "4h ago",
    keyPoints: [
      "New component library ready for review",
      "Documentation updated with examples",
      "Migration guide available",
    ],
    badges: ["project"],
    starred: true,
    attachments: 0,
  },
  {
    id: "3",
    from: "Emily Rodriguez",
    subject: "Team Offsite Planning",
    preview: "Looking forward to our team offsite next month! Here are some venue options...",
    receivedAt: "1d ago",
    keyPoints: ["Offsite scheduled for next month", "Three venue options to choose from", "RSVP needed by end of week"],
    badges: [],
    starred: false,
    attachments: 1,
  },
]

export function InboxFeed({ onCompose }: InboxFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emails, setEmails] = useState(mockEmails)
  const [isDragging, setIsDragging] = useState(false)

  const handleNext = () => {
    if (currentIndex < emails.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleStar = (id: string) => {
    setEmails(emails.map((email) => (email.id === id ? { ...email, starred: !email.starred } : email)))
  }

  const handleBlackhole = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id))
    if (currentIndex >= emails.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleBlackholeDrop = () => {
    handleBlackhole(emails[currentIndex].id)
    setIsDragging(false)
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-4xl">✨</span>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">Clear skies</h2>
        <p className="text-muted-foreground">No new messages.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <EmailCard
        email={emails[currentIndex]}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onStar={handleStar}
        onBlackhole={handleBlackhole}
        hasNext={currentIndex < emails.length - 1}
        hasPrevious={currentIndex > 0}
        isDragging={isDragging}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      <div className="flex items-center justify-center gap-1 mt-4">
        {emails.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <BlackholeZone isActive={isDragging} onDrop={handleBlackholeDrop} />
    </div>
  )
}
