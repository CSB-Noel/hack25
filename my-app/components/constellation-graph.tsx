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
  const hoveredMerchantRef = useRef<string | null>(null)
  const hoverLabelRef = useRef<{ x: number; y: number; name: string } | null>(null)
  const [hoverLabel, setHoverLabel] = useState<{ x: number; y: number; name: string } | null>(null)

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

  // create animated node state (local to this effect)
    const nodes = mockMerchants.map((m) => ({
      ...m,
      phase: Math.random() * Math.PI * 2,
      ampX: 2 + Math.random() * 4,
      ampY: 2 + Math.random() * 4,
      // px/py are base percentage positions (0-100)
      px: m.x,
      py: m.y,
    }))

    // per-edge highlight progress map (keyed by sorted id pair)
    const edgeProgress = new Map<string, number>()
    const edgeTarget = (a: string, b: string) => {
      const key = [a, b].sort().join("-")
      return edgeProgress.get(key) || 0
    }

    const setEdge = (a: string, b: string, v: number) => {
      const key = [a, b].sort().join("-")
      edgeProgress.set(key, v)
    }

    // initialize edges
    mockMerchants.forEach((m) => {
      m.connections.forEach((c) => setEdge(m.id, c, 0))
    })

  let raf = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const t = Date.now() / 1000

      // Draw connections with smooth highlight interpolation
      mockMerchants.forEach((merchant) => {
        const nodeA = nodes.find((n) => n.id === merchant.id)!
        const x1 = (nodeA.px / 100) * canvas.width + Math.sin(t + nodeA.phase) * nodeA.ampX
        const y1 = (nodeA.py / 100) * canvas.height + Math.cos(t + nodeA.phase) * nodeA.ampY

        merchant.connections.forEach((connId) => {
          const connMerchant = nodes.find((n) => n.id === connId)
          if (connMerchant) {
            const x2 = (connMerchant.px / 100) * canvas.width + Math.sin(t + connMerchant.phase) * connMerchant.ampX
            const y2 = (connMerchant.py / 100) * canvas.height + Math.cos(t + connMerchant.phase) * connMerchant.ampY

            // edge key and target highlight
            const key = [merchant.id, connId].sort().join("-")
            const currentHover = hoveredMerchantRef.current
            const target = currentHover === merchant.id || currentHover === connId ? 1 : 0
            const current = edgeProgress.get(key) || 0
            const lerped = current + (target - current) * 0.12 // smooth interpolation
            edgeProgress.set(key, lerped)

            // visual parameters based on progress and priority
            const prog = lerped
            const isPriority = merchant.priority > 0.7 && connMerchant.priority > 0.7
            const baseAlpha = isPriority ? 0.28 : 0.12
            const alpha = baseAlpha + prog * 0.7
            const width = 1 + prog * 2

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = `rgba(110,168,255,${alpha})`
            ctx.lineWidth = width
            ctx.lineCap = "round"
            ctx.stroke()
          }
        })
      })

      // Draw nodes with subtle motion and hover/pulse effects
      let foundHover = false
      mockMerchants.forEach((merchant) => {
        const node = nodes.find((n) => n.id === merchant.id)!
        const x = (node.px / 100) * canvas.width + Math.sin(t + node.phase) * node.ampX
        const y = (node.py / 100) * canvas.height + Math.cos(t + node.phase) * node.ampY
        const baseRadius = 6 + (merchant.spendVolume / 500) * 2
        const radius = Math.min(baseRadius, 12)

        // Outer glow for high priority or hovered (subtle)
  const currentHover = hoveredMerchantRef.current
  if (currentHover === merchant.id || merchant.priority > 0.8) {
          ctx.beginPath()
          ctx.arc(x, y, radius + 12 * (merchant.priority || 0.5), 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius + 12)
          const glowColor =
            merchant.type === "goal"
              ? "rgba(53, 224, 180, 0.28)"
              : merchant.type === "subscription"
                ? "rgba(255, 214, 110, 0.28)"
                : "rgba(110, 168, 255, 0.28)"
          gradient.addColorStop(0, glowColor)
          gradient.addColorStop(1, "rgba(110, 168, 255, 0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Node circle with type-based colors (slightly desaturated)
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        let fillColor = "#6ea8ff" // merchant
        if (merchant.type === "subscription") fillColor = "#ffd66e"
        else if (merchant.type === "category") fillColor = "#9fb3d1"
        else if (merchant.type === "goal") fillColor = "#35e0b4"

        // slight hover brighten
  const isHovered = hoveredMerchantRef.current === merchant.id
        ctx.fillStyle = isHovered ? brighten(fillColor, 0.15) : fillColor
        ctx.fill()

        // Border
        ctx.strokeStyle = isHovered ? "#e6ecf8" : "rgba(230, 236, 248, 0.28)"
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.stroke()

        // Pulse animation for recent activity (softer)
        if (merchant.recency > 0.9) {
          const pulseRadius = radius + 3 + Math.sin(Date.now() / 400) * 1.5
          ctx.beginPath()
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `${fillColor}40`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // if this is the hovered node, update hover label (throttled by small movement)
        if (hoveredMerchantRef.current === merchant.id) {
          foundHover = true

          // Estimate label size and clamp inside canvas bounds
          const labelPaddingX = 12 // px padding (left+right)
          const charWidth = 7 // approx px per char for small text
          const estWidth = merchant.name.length * charWidth + labelPaddingX
          const estHeight = 28

          // default preferred location: above-right of node
          let lx = Math.round(x + radius + 8)
          let ly = Math.round(y - radius - 8)

          // clamp horizontally
          if (lx + estWidth > canvas.width - 8) {
            lx = Math.round(x - radius - 8 - estWidth)
          }
          if (lx < 8) lx = 8

          // clamp vertically (if goes above top, put below node)
          if (ly < 8) {
            ly = Math.round(y + radius + 12)
          }
          if (ly + estHeight > canvas.height - 8) {
            ly = canvas.height - estHeight - 8
          }

          const newLabel = { x: lx, y: ly, name: merchant.name }
          const prev = hoverLabelRef.current
          if (
            !prev ||
            prev.name !== newLabel.name ||
            Math.hypot(prev.x - newLabel.x, prev.y - newLabel.y) > 0.5
          ) {
            hoverLabelRef.current = newLabel
            // update React state (will re-render label); small changes are ignored above
            setHoverLabel(newLabel)
          }
        }
      })

      if (!foundHover && hoverLabelRef.current) {
        hoverLabelRef.current = null
        setHoverLabel(null)
      }

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      // cancel animation frame
      // @ts-ignore
      cancelAnimationFrame(raf)
    }
  }, [])


// small helper to brighten a hex color by fraction (0-1)
function brighten(hex: string, amt: number) {
  try {
    const col = hex.replace('#','')
    const num = parseInt(col,16)
    let r = (num >> 16) + Math.round(255*amt)
    let g = ((num >> 8) & 0x00FF) + Math.round(255*amt)
    let b = (num & 0x0000FF) + Math.round(255*amt)
    r = Math.min(255, r)
    g = Math.min(255, g)
    b = Math.min(255, b)
    return `rgb(${r},${g},${b})`
  } catch (e) {
    return hex
  }
}

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

    // set both ref and state; animation loop reads the ref to avoid reinitialization
    hoveredMerchantRef.current = hovered?.id || null
    setHoveredMerchant(hovered?.id || null)
  }

  return (
    <div className="px-4 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Financial Constellation</h2>
        <p className="text-sm text-muted-foreground">Your spending network mapped</p>
      </div>

      <div className="relative">
  <Card className="bg-card/40 backdrop-blur-md border border-border overflow-hidden">
          <div className="relative h-[450px]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => { hoveredMerchantRef.current = null; setHoveredMerchant(null) }}
              className="w-full h-full cursor-pointer bg-transparent"
              style={{ background: 'transparent' }}
            />

            {/* Hover label rendered as HTML for crisp text */}
            {hoverLabel && (
              <div
                className="pointer-events-none absolute z-50 transform -translate-y-full"
                style={{ left: hoverLabel.x, top: hoverLabel.y }}
              >
                <div className="bg-background/90 text-foreground text-sm px-3 py-1 rounded-md shadow-md border border-border">
                  {hoverLabel.name}
                </div>
              </div>
            )}
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
