"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Star, Clock, AlertTriangle, TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AIHeader {
  bullets: string[]
  nextStep: string
  badges: string[]
  confidence: number
}

interface Insight {
  id: string
  kind: "bill" | "subscription" | "anomaly" | "goal" | "advice"
  title: string
  merchantOrBill: string
  amount: number
  date: string
  account: string
  category: string
  delta30: number
  delta90: number
  aiHeader: AIHeader
}

interface InsightCardProps {
  insight: Insight
  isActive: boolean
  onNext: () => void
  onPrevious: () => void
  onBlackhole: (id: string) => void
  onSnooze: (id: string) => void
  onDragStart: () => void
  onDragEnd: () => void
  isPressHold: boolean
  holdProgress: number
  cardDragPosition: {x: number, y: number} | null
  isDeleting: boolean
}

export function InsightCard({
  insight,
  isActive,
  onNext,
  onPrevious,
  onBlackhole,
  onSnooze,
  onDragStart,
  onDragEnd,
  isPressHold,
  holdProgress,
  cardDragPosition,
  isDeleting,
}: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSnoozing, setIsSnoozing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "priority":
        return "default"
      case "dueSoon":
        return "destructive"
      case "priceUp":
        return "destructive"
      case "duplicateSub":
        return "secondary"
      case "anomaly":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "priority":
        return <Star className="w-3 h-3" />
      case "dueSoon":
        return <Clock className="w-3 h-3" />
      case "priceUp":
        return <TrendingUp className="w-3 h-3" />
      case "anomaly":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return null
    }
  }

  const handleBlackholeAction = () => {
    if (isPressHold) {
      onBlackhole(insight.id)
    }
  }

  const handleSnoozeAction = () => {
    setIsSnoozing(true)
    
    // Add a delay to show the animation before moving the card
    setTimeout(() => {
      onSnooze(insight.id)
      setIsSnoozing(false)
    }, 600)
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div
        ref={cardRef}
        className={cn(
          "w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden transition-all select-none",
          isPressHold && "ring-2 ring-destructive",
          isSnoozing && "ring-2 ring-blue-500"
        )}
        style={{ 
          userSelect: 'none', 
          touchAction: 'none',
          transform: isSnoozing 
            ? `scale(0.95) translateY(-20px)` 
            : `scale(${1 - holdProgress * 0.5})`,
          opacity: isSnoozing 
            ? 0.7 
            : 1 - holdProgress * 0.7,
          transition: isPressHold || isSnoozing ? 'none' : 'all 300ms ease-out',
          pointerEvents: isDeleting || isSnoozing ? 'none' : 'auto'
        }}
      >
        {/* AI Header with badges and bullets */}
        <div className="bg-muted/30 p-4 border-b border-border">
          {insight.aiHeader.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {insight.aiHeader.badges.map((badge) => (
                <Badge key={badge} variant={getBadgeVariant(badge)} className="text-xs gap-1">
                  {getBadgeIcon(badge)}
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {insight.aiHeader.bullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-2">
                <Star className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{bullet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Meta row */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{insight.title}</h3>
              <p className="text-sm text-muted-foreground">{insight.merchantOrBill}</p>
            </div>
            <div className="text-right">
              <p className={cn("text-2xl font-bold", insight.kind === "goal" ? "text-[#35e0b4]" : "text-foreground")}>
                ${insight.amount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Delta strip */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {insight.delta30 > 0 ? (
                <TrendingUp className="w-4 h-4 text-[#f0616d]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#28c08e]" />
              )}
              <span className={insight.delta30 > 0 ? "text-[#f0616d]" : "text-[#28c08e]"}>
                {insight.delta30 > 0 ? "+" : ""}
                {insight.delta30.toFixed(1)}% 30d
              </span>
            </div>
            <div className="flex items-center gap-1">
              {insight.delta90 > 0 ? (
                <TrendingUp className="w-4 h-4 text-[#f0616d]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#28c08e]" />
              )}
              <span className={insight.delta90 > 0 ? "text-[#f0616d]" : "text-[#28c08e]"}>
                {insight.delta90 > 0 ? "+" : ""}
                {insight.delta90.toFixed(1)}% 90d
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {insight.category}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground">
            {new Date(insight.date).toLocaleDateString()} • {insight.account}
          </div>

          {/* Expandable body */}
          {isExpanded && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a detailed view of the transaction. In a real app, this would show the full email thread,
                transaction history, or additional context about this financial insight.
              </p>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full text-primary">
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-muted/20 border-t border-border">
          <div className="space-y-2">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
              {insight.aiHeader.nextStep}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-transparent hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
                onClick={handleSnoozeAction}
                disabled={isSnoozing}
              >
                <Clock className={cn("w-4 h-4 mr-2", isSnoozing && "animate-spin")} />
                {isSnoozing ? "Snoozing..." : "Snooze"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            {isPressHold ? "Release to send to blackhole" : "Press and hold anywhere to send to blackhole"}
          </p>
        </div>
      </div>
    </div>
  )
}
