"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from 'next-auth/react';
import { InsightCard } from '@/components/insight-card';
import { BlackholeZone } from '@/components/blackhole-zone';
import { json } from "stream/consumers";
import { useStore } from '@/app/store';

// Define the Insight type directly here
type Insight = {
  id: string;
  kind: 'subscription' | 'bill' | 'anomaly' | 'goal' | 'advice';
  title: string;
  merchantOrBill: string;
  amount: number;
  date: string;
  account: string;
  category: string;
  delta30: number;
  delta90: number;
  email: string;
  aiHeader: {
    bullets: string[];
    nextStep: string;
    badges: string[];
    confidence: number;
  };
};

// Celestial Loading Screen Component
function CelestialLoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create stars
    const stars: Array<{ x: number; y: number; size: number; opacity: number; speed: number }> = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.01
      });
    }

    // Create constellation points (forming a circular pattern)
    const constellationPoints: Array<{ x: number; y: number; radius: number; angle: number; speed: number }> = [];
    const numPoints = 8;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 80;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      constellationPoints.push({
        x: centerX,
        y: centerY,
        radius: baseRadius + Math.random() * 20,
        angle: angle,
        speed: 0.5 + Math.random() * 0.5
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Draw and animate stars
      stars.forEach(star => {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed = -star.speed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${Math.abs(star.opacity)})`;
        ctx.fill();
      });

      // Draw constellation pattern
      ctx.strokeStyle = 'rgba(110, 168, 255, 0.4)';
      ctx.lineWidth = 1.5;

      // Update and draw constellation points
      constellationPoints.forEach((point, i) => {
        const currentAngle = point.angle + time * point.speed;
        const x = point.x + Math.cos(currentAngle) * point.radius;
        const y = point.y + Math.sin(currentAngle) * point.radius;

        // Draw connections to next point (circular)
        const nextPoint = constellationPoints[(i + 1) % constellationPoints.length];
        const nextAngle = nextPoint.angle + time * nextPoint.speed;
        const nextX = nextPoint.x + Math.cos(nextAngle) * nextPoint.radius;
        const nextY = nextPoint.y + Math.sin(nextAngle) * nextPoint.radius;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();

        // Draw point with glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        gradient.addColorStop(0, 'rgba(110, 168, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(110, 168, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#6ea8ff';
        ctx.fill();
      });

      // Draw center connecting lines (every other point)
      ctx.strokeStyle = 'rgba(110, 168, 255, 0.2)';
      ctx.lineWidth = 1;
      constellationPoints.forEach((point, i) => {
        if (i % 2 === 0) {
          const currentAngle = point.angle + time * point.speed;
          const x = point.x + Math.cos(currentAngle) * point.radius;
          const y = point.y + Math.sin(currentAngle) * point.radius;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      // Draw center glow
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
      centerGradient.addColorStop(0, 'rgba(110, 168, 255, 0.6)');
      centerGradient.addColorStop(1, 'rgba(110, 168, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6ea8ff';
      ctx.fill();

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      />
      <div className="relative z-10 text-center">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-foreground mb-2">
            Mapping Your Financial Constellation
          </div>
          <div className="text-muted-foreground">
            Analyzing your universe of transactions{'.'.repeat(dots + 1)}
          </div>
        </div>
        
        {/* Orbital rings animation */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 border-2 border-primary/20 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 border-2 border-primary/10 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// No Insights Found Component
function NoInsightsFound({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {/* Simple star icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <svg
              className="w-16 h-16 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {/* Small sparkle dots */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Financial Insights Found
        </h2>
        <p className="text-muted-foreground mb-8">
          We couldn't find any financial transactions in your emails. Make sure your email account is connected and has transaction emails.
        </p>

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200 font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const { insights: cachedInsights, setInsights, isDataLoading, setIsDataLoading } = useStore();
  const [insights, setLocalInsights] = useState<Insight[] | null>(cachedInsights);
  const [loading, setLoading] = useState(cachedInsights === null);

  const fetchAIResults = async () => {
    setLoading(true);
    setIsDataLoading(true);
    
    try {
      // Fetch both APIs in parallel
      const [emailResult, nessieResult] = await Promise.allSettled([
        // Email/Gmail API fetch
        fetch('/api/ai-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'gmail', maxResults: 20 }),
        }).then(res => res.json()),
        
        // Nessie API fetch
        fetch('http://localhost:8000/fetch_insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: [] }),
        }).then(res => res.json())
      ]);

      // Process email results
      let emailInsights: Insight[] = [];
      if (emailResult.status === 'fulfilled') {
        const data = emailResult.value;
        console.log("Email Log: ", data);
        if (data.success && Array.isArray(data.result)) {
          emailInsights = data.result;
        } else {
          console.error("Email API error:", data.error);
        }
      } else {
        console.error("Email API fetch failed:", emailResult.reason);
      }

      // Process Nessie results
      let nessieInsights: Insight[] = [];
      if (nessieResult.status === 'fulfilled') {
        const data = nessieResult.value;
        console.log("Nessie Purchases:", data);
        try {
          const cleaned = data.result.replace(/```json\s*/i, "").replace(/```/g, "").trim();
          nessieInsights = JSON.parse(cleaned);
        } catch (parseErr) {
          console.error("Failed to parse Nessie insights:", parseErr);
        }
      } else {
        console.error("Nessie API fetch failed:", nessieResult.reason);
      }

      // Combine both results (even if one failed)
      const combinedInsights = [...emailInsights, ...nessieInsights];
      setLocalInsights(combinedInsights);
      setInsights(combinedInsights); // Cache in store
      
    } catch (err) {
      console.error("Unexpected error during fetch:", err);
      setLocalInsights([]);
      setInsights([]);
    } finally {
      setLoading(false);
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    
    // Only fetch if we don't have cached data
    if (cachedInsights === null) {
      fetchAIResults();
    } else {
      setLocalInsights(cachedInsights);
      setLoading(false);
    }
  }, [session, cachedInsights]);

  if (loading) return <CelestialLoadingScreen />;
  if (!insights || insights.length === 0) return <NoInsightsFound onRetry={fetchAIResults} />;

  return <FeedView initialInsights={insights} />;
}

interface FeedViewProps {
  initialInsights: Insight[];
}

function FeedView({ initialInsights }: FeedViewProps) {
  const [visibleCards, setVisibleCards] = useState(initialInsights);
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % visibleCards.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1) % visibleCards.length)
  }

  const handleBlackhole = (id: string) => {
    console.log("[v0] Blackhole action for insight:", id)
    
    // Remove card from visible cards
    setVisibleCards(prev => {
      const newCards = prev.filter(card => card.id !== id)
      
      // Adjust current index if needed using the new length
      if (currentIndex >= newCards.length) {
        setCurrentIndex(Math.max(0, newCards.length - 1))
      }
      
      return newCards
    })
  }

  const handleSnooze = (id: string) => {
    console.log("[v0] Snooze action for insight:", id)
    
    // Move card to the end of the list
    setVisibleCards(prev => {
      const cardToSnooze = prev.find(card => card.id === id)
      if (!cardToSnooze) return prev
      
      const otherCards = prev.filter(card => card.id !== id)
      const newCards = [...otherCards, cardToSnooze]
      
      // Adjust current index if we're snoozing the current card
      if (currentIndex >= otherCards.length) {
        setCurrentIndex(Math.max(0, otherCards.length - 1))
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
            transition: isTransitioning ? 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          {visibleCards.map((insight, index) => (
            <div key={insight.id} className="h-full snap-start">
              <InsightCard
                insight={insight}
                isActive={index === currentIndex}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onBlackhole={handleBlackhole}
                onSnooze={handleSnooze}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                isPressHold={isPressHold}
                holdProgress={holdProgress}
                cardDragPosition={cardDragPosition}
                isDeleting={isDeleting}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots - vertical on left side */}
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

      <BlackholeZone 
        isActive={isDragging} 
        isNearBlackhole={isNearBlackhole}
        onDrop={() => {
          if (isPressHold) {
            handleBlackhole(visibleCards[currentIndex].id)
          }
        }} 
      />
    </div>
  )
}
