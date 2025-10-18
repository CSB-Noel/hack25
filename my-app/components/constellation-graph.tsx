"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface MerchantNode {
  id: string
  name: string
  type: "merchant" | "subscription" | "category" | "goal"
  x: number
  y: number
  connections: string[]
  spendVolume: number
  recency: number
  priority: number
}

const mockMerchants: MerchantNode[] = [
  {
    id: "1",
    name: "Amazon",
    type: "merchant",
    x: 50,
    y: 30,
    connections: ["2", "3"],
    spendVolume: 1250,
    recency: 0.9,
    priority: 0.8,
  },
  {
    id: "2",
    name: "Groceries",
    type: "category",
    x: 30,
    y: 60,
    connections: ["1", "4"],
    spendVolume: 850,
    recency: 0.95,
    priority: 0.9,
  },
  {
    id: "3",
    name: "Spotify",
    type: "subscription",
    x: 70,
    y: 50,
    connections: ["1", "5"],
    spendVolume: 120,
    recency: 1.0,
    priority: 0.7,
  },
  {
    id: "4",
    name: "Whole Foods",
    type: "merchant",
    x: 50,
    y: 75,
    connections: ["2"],
    spendVolume: 450,
    recency: 0.85,
    priority: 0.6,
  },
  {
    id: "5",
    name: "Emergency Fund",
    type: "goal",
    x: 85,
    y: 70,
    connections: ["3"],
    spendVolume: 3250,
    recency: 0.8,
    priority: 0.95,
  },
  {
    id: "6",
    name: "Netflix",
    type: "subscription",
    x: 65,
    y: 25,
    connections: ["3"],
    spendVolume: 180,
    recency: 1.0,
    priority: 0.5,
  },
  {
    id: "7",
    name: "Utilities",
    type: "category",
    x: 20,
    y: 40,
    connections: ["2"],
    spendVolume: 320,
    recency: 0.7,
    priority: 0.85,
  },
]

export function ConstellationGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantNode | null>(null)
  const [hoveredMerchant, setHoveredMerchant] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      mockMerchants.forEach((merchant) => {
        const x1 = (merchant.x / 100) * canvas.width
        const y1 = (merchant.y / 100) * canvas.height

        merchant.connections.forEach((connId) => {
          const connMerchant = mockMerchants.find((m) => m.id === connId)
          if (connMerchant) {
            const x2 = (connMerchant.x / 100) * canvas.width
            const y2 = (connMerchant.y / 100) * canvas.height

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)

            const isHighlighted = hoveredMerchant === merchant.id || hoveredMerchant === connId
            const isPriority = merchant.priority > 0.7 && connMerchant.priority > 0.7

            ctx.strokeStyle = isHighlighted
              ? "rgba(110, 168, 255, 0.8)"
              : isPriority
                ? "rgba(110, 168, 255, 0.3)"
                : "rgba(110, 168, 255, 0.15)"
            ctx.lineWidth = isHighlighted ? 2 : 1
            ctx.stroke()
          }
        })
      })

      // Draw nodes
      mockMerchants.forEach((merchant) => {
        const x = (merchant.x / 100) * canvas.width
        const y = (merchant.y / 100) * canvas.height
        const baseRadius = 6 + (merchant.spendVolume / 500) * 2
        const radius = Math.min(baseRadius, 12)

        // Outer glow for high priority or hovered
        if (hoveredMerchant === merchant.id || merchant.priority > 0.8) {
          ctx.beginPath()
          ctx.arc(x, y, radius + 10, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius + 10)
          const glowColor =
            merchant.type === "goal"
              ? "rgba(53, 224, 180, 0.4)"
              : merchant.type === "subscription"
                ? "rgba(255, 214, 110, 0.4)"
                : "rgba(110, 168, 255, 0.4)"
          gradient.addColorStop(0, glowColor)
          gradient.addColorStop(1, "rgba(110, 168, 255, 0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Node circle with type-based colors
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        let fillColor = "#6ea8ff" // merchant
        if (merchant.type === "subscription") fillColor = "#ffd66e"
        else if (merchant.type === "category") fillColor = "#9fb3d1"
        else if (merchant.type === "goal") fillColor = "#35e0b4"

        ctx.fillStyle = fillColor
        ctx.fill()

        // Border
        ctx.strokeStyle = hoveredMerchant === merchant.id ? "#e6ecf8" : "rgba(230, 236, 248, 0.3)"
        ctx.lineWidth = hoveredMerchant === merchant.id ? 2 : 1
        ctx.stroke()

        // Pulse animation for recent activity
        if (merchant.recency > 0.9) {
          const pulseRadius = radius + 3 + Math.sin(Date.now() / 500) * 2
          ctx.beginPath()
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `${fillColor}40`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [hoveredMerchant])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const clicked = mockMerchants.find((merchant) => {
      const x = (merchant.x / 100) * canvas.width
      const y = (merchant.y / 100) * canvas.height
      const baseRadius = 6 + (merchant.spendVolume / 500) * 2
      const radius = Math.min(baseRadius, 12)
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)
      return distance <= radius + 5
    })

    setSelectedMerchant(clicked || null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const hovered = mockMerchants.find((merchant) => {
      const x = (merchant.x / 100) * canvas.width
      const y = (merchant.y / 100) * canvas.height
      const baseRadius = 6 + (merchant.spendVolume / 500) * 2
      const radius = Math.min(baseRadius, 12)
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
      return distance <= radius + 5
    })

    setHoveredMerchant(hovered?.id || null)
  }

  return (
    <div className="px-4 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Financial Constellation</h2>
        <p className="text-sm text-muted-foreground">Your spending network mapped</p>
      </div>

      <div className="relative">
        <Card className="bg-card border-border overflow-hidden">
          <div className="relative h-[450px]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredMerchant(null)}
              className="w-full h-full cursor-pointer"
            />
          </div>
        </Card>

        {selectedMerchant && (
          <Card className="mt-4 p-4 bg-card border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{selectedMerchant.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedMerchant.type}</p>
              </div>
              <Badge
                variant="secondary"
                className={
                  selectedMerchant.type === "goal"
                    ? "bg-[#35e0b4]/20 text-[#35e0b4]"
                    : selectedMerchant.type === "subscription"
                      ? "bg-[#ffd66e]/20 text-[#ffd66e]"
                      : "bg-primary/20 text-primary"
                }
              >
                {selectedMerchant.type}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {selectedMerchant.type === "goal" ? "Balance" : "Spend Volume"}
                </span>
                <span className="font-semibold text-foreground">${selectedMerchant.spendVolume.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connections</span>
                <span className="font-semibold text-foreground">{selectedMerchant.connections.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Activity</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {selectedMerchant.recency > 0.9 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-[#35e0b4]" />
                      Recent
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-muted-foreground" />
                      Older
                    </>
                  )}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Merchant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ffd66e]" />
          <span className="text-muted-foreground">Subscription</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#9fb3d1]" />
          <span className="text-muted-foreground">Category</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#35e0b4]" />
          <span className="text-muted-foreground">Goal</span>
        </div>
      </div>
    </div>
  )
}
