"use client"

import { useState, useRef, useEffect } from "react"
import { InsightCard } from "@/components/insight-card"
import { BlackholeZone } from "@/components/blackhole-zone"

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
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [isPressHold, setIsPressHold] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const pressTimerRef = useRef<NodeJS.Timeout>()

  // Handle window blur to stop scrolling when user leaves window
  useEffect(() => {
    const handleWindowBlur = () => {
      if (isPointerDown) {
        setIsPointerDown(false)
        setDragOffset(0)
        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current)
        }
      }
    }

    window.addEventListener('blur', handleWindowBlur)
    return () => window.removeEventListener('blur', handleWindowBlur)
  }, [isPointerDown])

  const handleNext = () => {
    if (currentIndex < sampleInsights.length - 1) {
      setCurrentIndex(currentIndex + 1)
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
    if (currentIndex < sampleInsights.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePointerStart = (e: React.PointerEvent) => {
    if (isTransitioning) return
    
    e.preventDefault()
    setIsPointerDown(true)
    setTouchStartY(e.clientY)
    setTouchStartTime(Date.now())
    setDragOffset(0)
    setIsPressHold(false)

    // Start press-and-hold timer
    pressTimerRef.current = setTimeout(() => {
      setIsPressHold(true)
      setIsDragging(true)
    }, 400)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isTransitioning || !isPointerDown) return

    e.preventDefault()
    const deltaY = e.clientY - touchStartY
    const deltaTime = Date.now() - touchStartTime

    // Clear press-and-hold timer if there's movement
    if (pressTimerRef.current && Math.abs(deltaY) > 10) {
      clearTimeout(pressTimerRef.current)
      setIsPressHold(false)
    }

    // If in press-hold mode, don't handle swipe navigation
    if (isPressHold) return

    // Calculate swipe threshold (15% of viewport height - lower threshold)
    const swipeThreshold = window.innerHeight * 0.15
    
    // Check for quick swipe (within 300ms) or slow swipe (15% threshold)
    const isQuickSwipe = deltaTime < 300 && Math.abs(deltaY) > 30
    const isSlowSwipe = Math.abs(deltaY) > swipeThreshold

    // Always update drag offset for live feedback, but limit it to prevent overshooting
    if (isQuickSwipe || isSlowSwipe) {
      // Limit drag offset to prevent excessive movement
      const maxOffset = window.innerHeight * 0.3
      setDragOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaY)))
    } else {
      // For smaller movements, still show some feedback
      setDragOffset(deltaY * 0.5)
    }
  }

  const handlePointerEnd = () => {
    if (isTransitioning) return

    // Clear press-and-hold timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
    }

    setIsPointerDown(false)
    const deltaY = dragOffset
    const deltaTime = Date.now() - touchStartTime
    const swipeThreshold = window.innerHeight * 0.15

    // If in press-hold mode, handle blackhole
    if (isPressHold) {
      setIsDragging(false)
      setIsPressHold(false)
      setDragOffset(0)
      return
    }

    // Check for swipe navigation
    const isQuickSwipe = deltaTime < 300 && Math.abs(deltaY) > 30
    const isSlowSwipe = Math.abs(deltaY) > swipeThreshold

    if (isQuickSwipe || isSlowSwipe) {
      // Clear drag offset immediately to prevent overshooting
      setDragOffset(0)
      setIsTransitioning(true)
      
      if (deltaY < 0 && currentIndex < sampleInsights.length - 1) {
        // Swipe up - next card
        setCurrentIndex(currentIndex + 1)
      } else if (deltaY > 0 && currentIndex > 0) {
        // Swipe down - previous card
        setCurrentIndex(currentIndex - 1)
      }
      
      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    } else {
      // Bounce back if swipe wasn't sufficient
      setDragOffset(0)
    }
  }

  // Handle window leave to stop scrolling
  const handlePointerLeave = () => {
    if (isPointerDown) {
      setIsPointerDown(false)
      setDragOffset(0)
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current)
      }
    }
  }

  return (
    <div 
      className="relative h-[calc(100vh-8rem)] select-none"
      onPointerDown={handlePointerStart}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerLeave}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <div className="h-full overflow-hidden">
        <div
          className="h-full"
          style={{ 
            transform: `translateY(calc(-${currentIndex * 100}% + ${isTransitioning ? 0 : dragOffset}px))`,
            transition: isTransitioning ? 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
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
                isPressHold={isPressHold}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots - vertical on left side */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {sampleInsights.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-primary h-6" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <BlackholeZone 
        isActive={isDragging} 
        onDrop={() => {
          if (isPressHold) {
            handleBlackhole(sampleInsights[currentIndex].id)
          }
        }} 
      />
    </div>
  )
}
