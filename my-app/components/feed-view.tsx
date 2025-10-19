"use client"

import { useState, useRef, useEffect } from "react"
import { InsightCard } from "@/components/insight-card"
import { BlackholeZone } from "@/components/blackhole-zone"



interface Insight {
  id: string;
  kind: "subscription" | "bill" | "anomaly" | "goal" | "advice";
  title: string;
  merchantOrBill: string;
  amount: number;
  date: string;
  account: string;
  category: string;
  delta30: number;
  delta90: number;
  aiHeader: {
    bullets: string[];
    nextStep: string;
    badges: string[];
    confidence: number;
  };
}




// Sample financial insights data
// const sampleInsights = [
//   {
//     id: "1",
//     kind: "subscription" as const,
//     title: "Spotify price increased",
//     merchantOrBill: "Spotify",
//     amount: 10.99,
//     date: "2025-10-01T10:22:00Z",
//     account: "Capital One Savor",
//     category: "Entertainment",
//     delta30: 1.0,
//     delta90: 1.0,
//     aiHeader: {
//       bullets: [
//         "Price up $1.00 vs last month",
//         "Duplicate service: also paying Apple Music",
//         "Low usage in past 60 days",
//       ],
//       nextStep: "Keep Spotify, cancel Apple Music?",
//       badges: ["priority", "priceUp", "duplicateSub"],
//       confidence: 0.91,
//     },
//   },
//   {
//     id: "2",
//     kind: "bill" as const,
//     title: "Electric bill due soon",
//     merchantOrBill: "Pacific Gas & Electric",
//     amount: 142.5,
//     date: "2025-10-15T00:00:00Z",
//     account: "Chase Checking",
//     category: "Utilities",
//     delta30: 12.5,
//     delta90: -5.2,
//     aiHeader: {
//       bullets: ["Due in 3 days", "Up 9.6% from last month", "Balance sufficient to pay"],
//       nextStep: "Schedule payment now?",
//       badges: ["dueSoon"],
//       confidence: 0.95,
//     },
//   },
//   {
//     id: "3",
//     kind: "anomaly" as const,
//     title: "Unusual spending detected",
//     merchantOrBill: "Amazon",
//     amount: 287.43,
//     date: "2025-10-12T14:30:00Z",
//     account: "Capital One Savor",
//     category: "Shopping",
//     delta30: 150.0,
//     delta90: 200.0,
//     aiHeader: {
//       bullets: ["3x your typical Amazon spend", "Multiple charges in one day", "Consider setting a monthly cap"],
//       nextStep: "Review charges or set budget alert?",
//       badges: ["anomaly"],
//       confidence: 0.88,
//     },
//   },
//   {
//     id: "4",
//     kind: "goal" as const,
//     title: "Emergency fund progress",
//     merchantOrBill: "Savings Goal",
//     amount: 3250.0,
//     date: "2025-10-18T00:00:00Z",
//     account: "High-Yield Savings",
//     category: "Savings",
//     delta30: 500.0,
//     delta90: 1250.0,
//     aiHeader: {
//       bullets: ["65% to your $5,000 target", "On track to reach goal in 4 months", "Found $150 excess in checking"],
//       nextStep: "Sweep excess to savings?",
//       badges: [],
//       confidence: 0.92,
//     },
//   },
//   {
//     id: "5",
//     kind: "advice" as const,
//     title: "Subscription optimization",
//     merchantOrBill: "Multiple Services",
//     amount: 89.97,
//     date: "2025-10-18T00:00:00Z",
//     account: "Multiple Accounts",
//     category: "Subscriptions",
//     delta30: 0,
//     delta90: 0,
//     aiHeader: {
//       bullets: [
//         "Paying for 3 streaming services",
//         "Could save $30/mo with family plan",
//         "Netflix, Hulu, Disney+ detected",
//       ],
//       nextStep: "Switch to bundle plan?",
//       badges: ["priority"],
//       confidence: 0.87,
//     },
//   },
// ]
const sampleInsights: Insight[] = []
export function FeedView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [isPressHold, setIsPressHold] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [cardDragPosition, setCardDragPosition] = useState<{x: number, y: number} | null>(null)
  const [isNearBlackhole, setIsNearBlackhole] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [visibleCards, setVisibleCards] = useState(sampleInsights)
  const [blackholeTimer, setBlackholeTimer] = useState<NodeJS.Timeout | null>(null)
  const pressTimerRef = useRef<NodeJS.Timeout>()
  const holdAnimationRef = useRef<number>()
  const isPressHoldRef = useRef(false)

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

  // useEffect(() => {
  //   const fetchInsights = async () => {
  //     try {
  //       const response = await fetch("http://localhost:5000/emails");
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       console.log("Fetched insights:", data);
  //       // Normalize incoming email objects to the Insight interface expected by InsightCard
  //       const normalize = (item: any, idx: number) => {
  //         // If item already looks like an Insight, try to keep it
  //         if (item && item.id && item.aiHeader && Array.isArray(item.aiHeader.bullets)) return item

  //         // Map common email properties to insight fields with safe defaults
  //         const id = item.id ?? item.messageId ?? `email-${Date.now()}-${idx}`
  //         const subject = item.subject ?? item.title ?? "(no subject)"
  //         const from = item.from?.name ?? item.from?.email ?? item.sender ?? "Unknown sender"
  //         const amount = typeof item.amount === 'number' ? item.amount : 0
  //         const date = item.date ?? item.receivedDate ?? new Date().toISOString()
  //         const account = item.account ?? "Email"
  //         const category = item.category ?? "Email"

  //         const aiHeader = item.aiHeader ?? {
  //           bullets: item.preview ? [String(item.preview).slice(0, 140)] : ["Preview not available"],
  //           nextStep: item.recommendation ?? "Review",
  //           badges: item.badges ?? [],
  //           confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
  //         }

  //         return {
  //           id,
  //           kind: (item.kind as any) ?? "advice",
  //           title: subject,
  //           merchantOrBill: from,
  //           amount,
  //           date,
  //           account,
  //           category,
  //           delta30: typeof item.delta30 === 'number' ? item.delta30 : 0,
  //           delta90: typeof item.delta90 === 'number' ? item.delta90 : 0,
  //           aiHeader,
  //         }
  //       }

  //       // The server may return either an array or an object like { insights: [...] }
  //       let insightsArray: any[] = []
  //       if (Array.isArray(data)) {
  //         insightsArray = data
  //       } else if (data && Array.isArray(data.insights)) {
  //         insightsArray = data.insights
  //       } else if (data && typeof data.insights === 'string') {
  //         try {
  //           const parsed = JSON.parse(data.insights)
  //           if (Array.isArray(parsed)) insightsArray = parsed
  //         } catch (err) {
  //           console.warn('Could not parse stringified insights', err)
  //         }
  //       }

  //       if (insightsArray.length === 0) {
  //         console.warn('Unexpected payload for /emails, expected array or { insights: [] }. Falling back to sampleInsights.', data)
  //         setVisibleCards(sampleInsights)
  //       } else {
  //         const normalized = insightsArray.map(normalize)
  //         console.log('Normalized insights:', normalized)
  //         setVisibleCards(normalized)
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch insights:", error);
  //     }
  //   };
  //   fetchInsights();
    
  // }, []);

  const handleVerify = async () => {
    const response = await fetch("http://localhost:5000/login");
    
    console.log("Response from /login:", response);
  
    const fetchInsights = async () => {
      try {
        const response = await fetch("http://localhost:5000/emails");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched insights:", data);
        // Normalize incoming email objects to the Insight interface expected by InsightCard
        const normalize = (item: any, idx: number) => {
          // If item already looks like an Insight, try to keep it
          if (item && item.id && item.aiHeader && Array.isArray(item.aiHeader.bullets)) return item

          // Map common email properties to insight fields with safe defaults
          const id = item.id ?? item.messageId ?? `email-${Date.now()}-${idx}`
          const subject = item.subject ?? item.title ?? "(no subject)"
          const from = item.from?.name ?? item.from?.email ?? item.sender ?? "Unknown sender"
          const amount = typeof item.amount === 'number' ? item.amount : 0
          const date = item.date ?? item.receivedDate ?? new Date().toISOString()
          const account = item.account ?? "Email"
          const category = item.category ?? "Email"

          const aiHeader = item.aiHeader ?? {
            bullets: item.preview ? [String(item.preview).slice(0, 140)] : ["Preview not available"],
            nextStep: item.recommendation ?? "Review",
            badges: item.badges ?? [],
            confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
          }

          return {
            id,
            kind: (item.kind as any) ?? "advice",
            title: subject,
            merchantOrBill: from,
            amount,
            date,
            account,
            category,
            delta30: typeof item.delta30 === 'number' ? item.delta30 : 0,
            delta90: typeof item.delta90 === 'number' ? item.delta90 : 0,
            aiHeader,
          }
        }

        // The server may return either an array or an object like { insights: [...] }
        let insightsArray: any[] = []
        if (Array.isArray(data)) {
          insightsArray = data
        } else if (data && Array.isArray(data.insights)) {
          insightsArray = data.insights
        } else if (data && typeof data.insights === 'string') {
          try {
            const parsed = JSON.parse(data.insights)
            if (Array.isArray(parsed)) insightsArray = parsed
          } catch (err) {
            console.warn('Could not parse stringified insights', err)
          }
        }

        if (insightsArray.length === 0) {
          console.warn('Unexpected payload for /emails, expected array or { insights: [] }. Falling back to sampleInsights.', data)
          setVisibleCards(sampleInsights)
        } else {
          const normalized = insightsArray.map(normalize)
          console.log('Normalized insights:', normalized)
          setVisibleCards(normalized)
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
      }
    };
    fetchInsights();
  }

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % visibleCards.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1) % visibleCards.length)
  }

  const handleBlackhole = (id: string) => {
    console.log("[v0] Blackhole action for insight:", id)
    
    // Remove card from visible cards
    setVisibleCards((prev: any[]) => {
      const newCards = prev.filter(card => card.id !== id)
      
      // Adjust current index if needed using the new length
      if (currentIndex >= newCards.length) {
        setCurrentIndex(Math.max(0, newCards.length - 1))
      }
      
      return newCards
    })
  }

  const startHoldAnimation = () => {
    console.log("Starting hold animation")
    const startTime = Date.now()
    const duration = 1000 // 1 second to full progress
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setHoldProgress(progress)
      
      // Debug logging - show progress every 20%
      if (progress > 0.1 && Math.floor(progress * 5) !== Math.floor((progress - 0.01) * 5)) {
        console.log(`Hold progress: ${(progress * 100).toFixed(1)}%`)
      }
      
      // If progress reaches 100%, trigger deletion immediately
      if (progress >= 1 && !isDeleting) {
        console.log("Hold progress reached 100%, triggering immediate deletion")
        setIsDeleting(true)
        handleBlackhole(visibleCards[currentIndex].id)
        resetHoldState()
        return // Stop the animation
      }
      
      // Continue animation regardless of isPressHold state (it might get reset by movement)
      if (progress < 1) {
        holdAnimationRef.current = requestAnimationFrame(updateProgress)
      }
    }
    holdAnimationRef.current = requestAnimationFrame(updateProgress)
  }

  const stopHoldAnimation = () => {
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current)
      holdAnimationRef.current = undefined
    }
    setHoldProgress(0)
  }

  const resetHoldState = () => {
    setIsPressHold(false)
    isPressHoldRef.current = false
    setIsDragging(false)
    setHoldProgress(0)
    setCardDragPosition(null)
    setIsNearBlackhole(false)
    setIsDeleting(false)
    stopHoldAnimation()
    
    // Clear blackhole timer if it exists
    if (blackholeTimer) {
      clearTimeout(blackholeTimer)
      setBlackholeTimer(null)
    }
  }

  const handlePointerStart = (e: React.PointerEvent) => {
    if (isTransitioning) return
    
    e.preventDefault()
    setIsPointerDown(true)
    setTouchStartY(e.clientY)
    setTouchStartTime(Date.now())
    setDragOffset(0)
    
    // Only reset if not already in a hold state
    if (!isPressHold) {
      setIsPressHold(false)
      setIsDragging(false)
      setHoldProgress(0)
      setCardDragPosition(null)
      setIsNearBlackhole(false)
      setIsDeleting(false)
    }

    // Start press-and-hold timer
    pressTimerRef.current = setTimeout(() => {
      console.log("Hold timer triggered - entering blackhole mode")
      setIsPressHold(true)
      isPressHoldRef.current = true
      setIsDragging(true)
      startHoldAnimation()
    }, 400)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isTransitioning || !isPointerDown) return

    e.preventDefault()
    const deltaY = e.clientY - touchStartY
    const deltaTime = Date.now() - touchStartTime

    // Only clear press-and-hold timer if there's significant movement (not just small jitter)
    if (pressTimerRef.current && Math.abs(deltaY) > 30) {
      console.log("Significant movement detected, canceling hold timer")
      clearTimeout(pressTimerRef.current)
      stopHoldAnimation()
      setIsPressHold(false)
      isPressHoldRef.current = false
    }

    // If in press-hold mode, track card drag position for blackhole interaction
    if (isPressHold) {
      console.log("In blackhole mode - tracking drag position")
      const cardX = e.clientX
      const cardY = e.clientY
      setCardDragPosition({ x: cardX, y: cardY })

      // Calculate distance to blackhole (bottom center)
      const blackholePosition = { 
        x: window.innerWidth / 2, 
        y: window.innerHeight - 128 // bottom-32
      }
      const distance = Math.sqrt(
        Math.pow(cardX - blackholePosition.x, 2) + 
        Math.pow(cardY - blackholePosition.y, 2)
      )
      
      // Check if card is near blackhole threshold (150px) or at bottom of screen
      const isNearThreshold = distance < 150
      const isAtBottom = cardY > window.innerHeight - 150 // Increased threshold
      
      // Debug logging
      if (cardY > window.innerHeight - 200) {
        console.log(`Card Y: ${cardY}, Screen Height: ${window.innerHeight}, Threshold: ${window.innerHeight - 150}, IsAtBottom: ${isAtBottom}`)
      }
      
      setIsNearBlackhole(isNearThreshold)
      
      // If card reaches bottom threshold, trigger deletion
      if (isAtBottom) {
        console.log("Card reached bottom threshold, triggering deletion")
        setIsDeleting(true)
        setTimeout(() => {
          handleBlackhole(visibleCards[currentIndex].id)
          resetHoldState()
        }, 300)
      }
      return
    }

    // Handle normal swipe navigation (only if not in blackhole mode)
    if (!isPressHold) {
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

    // If in press-hold mode, handle blackhole deletion
    if (isPressHold) {
      if (isNearBlackhole) {
        // Trigger deletion animation
        setIsDeleting(true)
        setTimeout(() => {
          handleBlackhole(visibleCards[currentIndex].id)
          resetHoldState()
        }, 500)
      } else {
        // Cancel hold and reset card
        resetHoldState()
      }
      return
    }

    // Check for swipe navigation
    const isQuickSwipe = deltaTime < 300 && Math.abs(deltaY) > 30
    const isSlowSwipe = Math.abs(deltaY) > swipeThreshold

    if (isQuickSwipe || isSlowSwipe) {
      // Clear drag offset immediately to prevent overshooting
      setDragOffset(0)
      setIsTransitioning(true)
      
      if (deltaY < 0 && currentIndex < visibleCards.length - 1) {
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
      resetHoldState()
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
            transition: isTransitioning ? 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          }}
        >
          {visibleCards.length === 0 ? (
            // Render login card
            <div className="h-full flex items-center justify-center">
              <button
                onClick={handleVerify}
                className="px-6 py-3 bg-primary text-white rounded-lg text-lg"
              >
                Login
              </button>
            </div>
          ) : (
            visibleCards.map((insight, index: number) => (
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
                  holdProgress={holdProgress}
                  cardDragPosition={cardDragPosition}
                  isDeleting={isDeleting}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination dots */}
      {visibleCards.length > 0 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {visibleCards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary h-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      <BlackholeZone
        isActive={isDragging}
        isNearBlackhole={isNearBlackhole}
        onDrop={() => {
          if (isPressHold && visibleCards.length > 0) {
            handleBlackhole(visibleCards[currentIndex].id)
          }
        }}
      />
    </div>
  )
}
