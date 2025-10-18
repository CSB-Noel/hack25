"use client"

import { useState } from "react"
import { Star, Reply, Clock, Trash2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  receivedAt: string
  keyPoints: string[]
  badges: string[]
  starred: boolean
  attachments: number
}

interface EmailCardProps {
  email: Email
  onNext: () => void
  onPrevious: () => void
  onStar: (id: string) => void
  onBlackhole: (id: string) => void
  hasNext: boolean
  hasPrevious: boolean
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function EmailCard({
  email,
  onNext,
  onPrevious,
  onStar,
  onBlackhole,
  hasNext,
  hasPrevious,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: EmailCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showBlackholeConfirm, setShowBlackholeConfirm] = useState(false)

  const handleBlackhole = () => {
    setShowBlackholeConfirm(true)
    setTimeout(() => {
      onBlackhole(email.id)
      setShowBlackholeConfirm(false)
    }, 300)
  }

  return (
    <div className="px-4 max-w-md mx-auto">
      <Card
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "bg-card border-border shadow-xl overflow-hidden transition-all cursor-grab active:cursor-grabbing",
          isDragging && "opacity-50 scale-95 rotate-2",
        )}
      >
        {/* Key Points Header */}
        <div className="bg-primary/5 border-b border-primary/10 p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-primary mt-2" />
            <div className="flex-1 space-y-1">
              {email.keyPoints.map((point, index) => (
                <p key={index} className="text-sm text-foreground leading-relaxed">
                  {point}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Meta Row */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {email.from
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{email.from}</p>
                <p className="text-xs text-muted-foreground">{email.receivedAt}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {email.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs capitalize bg-secondary/50">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
          <h3 className="font-semibold text-lg text-foreground">{email.subject}</h3>
        </div>

        {/* Preview Body */}
        <div className="p-4">
          <p
            className={cn("text-foreground leading-relaxed transition-all", !expanded && "line-clamp-6")}
            onClick={() => setExpanded(!expanded)}
          >
            {email.preview}
          </p>
          {!expanded && (
            <button onClick={() => setExpanded(true)} className="text-primary text-sm mt-2 font-medium">
              Read more
            </button>
          )}
        </div>

        {/* Attachments */}
        {email.attachments > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {email.attachments} attachment{email.attachments > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="p-4 border-t border-border flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1">
            <Reply className="w-5 h-5" />
            <span className="text-xs">Reply</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1" onClick={() => onStar(email.id)}>
            <Star className={cn("w-5 h-5", email.starred && "fill-primary text-primary")} />
            <span className="text-xs">Star</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Snooze</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-2 gap-1 text-destructive hover:text-destructive"
            onClick={handleBlackhole}
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-xs">Blackhole</span>
          </Button>
        </div>
      </Card>

      {/* Blackhole Confirmation */}
      {showBlackholeConfirm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="mx-4 p-6 max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Sending to blackhole</h3>
            <p className="text-sm text-muted-foreground">This destroys the email permanently.</p>
          </Card>
        </div>
      )}
    </div>
  )
}
