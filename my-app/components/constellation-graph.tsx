"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { RawTransaction, ClassifiedItem } from "../lib/analysis"
import { normalizeAnalyzeResponse } from "../lib/analysis"
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
]

  // mapping table for friendly category labels (kept for future use)
  const CATEGORY_LABEL_MAP: Record<string, string> = {
    'Fixed::Housing': 'Housing',
    'Fixed::Debt': 'Debt',
    'Fixed::Subscriptions': 'Subscriptions',
    "Variable::Groceries": 'Groceries',
    'Variable::Dining/Takeout': 'Dining',
    'Variable::Transportation': 'Transportation',
    'Variable::Health&Personal': 'Health & Personal',
    'Variable::Impulse&Wants': 'Impulse & Wants',
    'Income::Salary': 'Salary',
    'Transfer::P2P': 'P2P',
  }
  // color map for specific categories (enum keys)
  const CATEGORY_COLOR_MAP: Record<string, string> = {
    'Fixed::Housing': '#6ea8ff',
    'Fixed::Debt': '#9fb3d1',
    'Fixed::Subscriptions': '#ffd66e',
    'Variable::Groceries': '#a3d39c',
    'Variable::Dining/Takeout': '#ffb380',
    'Variable::Transportation': '#9ad0ff',
    'Variable::Health&Personal': '#f6a5c0',
    'Variable::Impulse&Wants': '#d39bff',
    'Income::Salary': '#7be3a8',
    'Transfer::P2P': '#c9c9c9',
  }

  // fallback color by node type
  const TYPE_COLOR_MAP: Record<string, string> = {
    merchant: '#6ea8ff',
    subscription: '#ffd66e',
    category: '#9fb3d1',
    goal: '#35e0b4',
  }

export function ConstellationGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantNode | null>(null)
  const [hoveredMerchant, setHoveredMerchant] = useState<string | null>(null)
  const hoveredMerchantRef = useRef<string | null>(null)
  const hoverLabelRef = useRef<{ x: number; y: number; name: string } | null>(null)
  const [hoverLabel, setHoverLabel] = useState<{ x: number; y: number; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const nodesRef = useRef<any[]>([])
  const categoriesRef = useRef<any[]>([])
  const spanningEdgesRef = useRef<Array<[string, string]>>([])

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
    // initial nodes are empty; we'll populate nodesRef and categoriesRef after calling the API
    const nodes: any[] = []
    nodesRef.current = nodes

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

    // edges will be created on-the-fly from nodesRef / categoriesRef when available

  let raf = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const t = Date.now() / 1000

      // Draw connections with smooth highlight interpolation
      const currentNodes = nodesRef.current || []
      const cats = categoriesRef.current || []

      // collect edges from merchant->merchant and category->merchant
      const edges: Array<[string, string]> = []
      currentNodes.forEach((m: any) => {
        (m.connections || []).forEach((otherId: string) => edges.push([m.id, otherId]))
      })
      cats.forEach((c: any) => {
        (c.connections || []).forEach((mid: string) => edges.push([c.id, mid]))
      })

      // unique
      const uniq = new Set<string>()
      const uniqueEdges: Array<[string, string]> = []
      edges.forEach(([a, b]) => {
        const key = [a, b].sort().join("-")
        if (!uniq.has(key)) {
          uniq.add(key)
          uniqueEdges.push([a, b])
        }
      })

      uniqueEdges.forEach(([a, b]) => {
        const na = currentNodes.find((n: any) => n.id === a) || cats.find((c: any) => c.id === a)
        const nb = currentNodes.find((n: any) => n.id === b) || cats.find((c: any) => c.id === b)
        if (!na || !nb) return
        const x1 = (na.px ?? na.x) / 100 * canvas.width + (na.phase ? Math.sin(t + na.phase) * (na.ampX || 2) : 0)
        const y1 = (na.py ?? na.y) / 100 * canvas.height + (na.phase ? Math.cos(t + na.phase) * (na.ampY || 2) : 0)
        const x2 = (nb.px ?? nb.x) / 100 * canvas.width + (nb.phase ? Math.sin(t + nb.phase) * (nb.ampX || 2) : 0)
        const y2 = (nb.py ?? nb.y) / 100 * canvas.height + (nb.phase ? Math.cos(t + nb.phase) * (nb.ampY || 2) : 0)

        const key = [a, b].sort().join('-')
        const currentHover = hoveredMerchantRef.current
        const target = currentHover === a || currentHover === b ? 1 : 0
        const current = edgeProgress.get(key) || 0
        const lerped = current + (target - current) * 0.12
        edgeProgress.set(key, lerped)

        const prog = lerped
        const alpha = 0.12 + prog * 0.7
        const width = 1 + prog * 2

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(110,168,255,${alpha})`
        ctx.lineWidth = width
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      // Draw nodes with subtle motion and hover/pulse effects
      let foundHover = false
      const currentNodes2 = nodesRef.current || []
      currentNodes2.forEach((merchant: any) => {
        const node = merchant
        const x = (node.px / 100) * canvas.width + Math.sin(t + node.phase) * node.ampX
        const y = (node.py / 100) * canvas.height + Math.cos(t + node.phase) * node.ampY
        const baseRadius = 6 + (merchant.spendVolume / 500) * 2
        const radius = Math.min(baseRadius, 12)

        // Outer glow for high priority or hovered (subtle)
        const currentHover = hoveredMerchantRef.current
        // sanitize priority to avoid negative or extreme values coming from API/data
        const priority = Math.max(0, Math.min(1, merchant.priority ?? 0.5))
        if (currentHover === merchant.id || priority > 0.8) {
          // compute glow radius and ensure it's non-negative before calling arc
          const glowRadius = Math.max(0, radius + 12 * priority)
          ctx.beginPath()
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
          // outer radius for radial gradient should be >= inner radius; use same priority multiplier
          const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius + 12 * priority)
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
          const merchantName = merchant.name || merchant.id
          const estWidth = merchantName.length * charWidth + labelPaddingX
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

          const newLabel = { x: lx, y: ly, name: merchantName }
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

      // draw category nodes and edges (read from ref to avoid effect deps)
      const categoryNodes = categoriesRef.current || []
      categoryNodes.forEach((cat) => {
        // draw edges from category to connected merchants
        const x1 = (cat.x / 100) * canvas.width
        const y1 = (cat.y / 100) * canvas.height
        cat.connections.forEach((connId: string) => {
          const connMerchant = currentNodes.find((n: any) => n.id === connId)
          if (!connMerchant) return
          const x2 = (connMerchant.px / 100) * canvas.width + Math.sin(t + connMerchant.phase) * connMerchant.ampX
          const y2 = (connMerchant.py / 100) * canvas.height + Math.cos(t + connMerchant.phase) * connMerchant.ampY
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = 'rgba(53,224,180,0.18)'
          ctx.lineWidth = 1
          ctx.stroke()
        })

        // draw the category node (color from CATEGORY_COLOR_MAP when available)
        const radius = Math.min(14, 6 + cat.spendVolume / 500)
        ctx.beginPath()
        ctx.arc(x1, y1, radius, 0, Math.PI * 2)
        const catColor = CATEGORY_COLOR_MAP[cat.name] || TYPE_COLOR_MAP.category
        const isHovered = hoveredMerchantRef.current === cat.id
        ctx.fillStyle = isHovered ? brighten(catColor, 0.15) : catColor
        ctx.fill()
        ctx.strokeStyle = isHovered ? 'rgba(230,236,248,0.6)' : 'rgba(230,236,248,0.28)'
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.stroke()

        // hover label for category nodes
        const displayName = (cat.name || '').toString().split('::').pop() || cat.name
        if (hoveredMerchantRef.current === cat.id) {
          foundHover = true
          const labelPaddingX = 12
          const charWidth = 7
          const estWidth = (displayName || '').toString().length * charWidth + labelPaddingX
          const estHeight = 28

          let lx = Math.round(x1 + radius + 8)
          let ly = Math.round(y1 - radius - 8)

          if (lx + estWidth > canvas.width - 8) {
            lx = Math.round(x1 - radius - 8 - estWidth)
          }
          if (lx < 8) lx = 8

          if (ly < 8) {
            ly = Math.round(y1 + radius + 12)
          }
          if (ly + estHeight > canvas.height - 8) {
            ly = canvas.height - estHeight - 8
          }

          const newLabel = { x: lx, y: ly, name: displayName }
          const prev = hoverLabelRef.current
          if (!prev || prev.name !== newLabel.name || Math.hypot(prev.x - newLabel.x, prev.y - newLabel.y) > 0.5) {
            hoverLabelRef.current = newLabel
            setHoverLabel(newLabel)
          }
        }
        // hover-only labels handled via hoverLabel state
      })

      if (!foundHover) {
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

  // Debug helper: run a sample analyze call and populate the graph (mirrors curl command)
  const runSample = async () => {
    const sample = {
      transactions: [
        {
          purchase_id: 't1',
          merchant_id: 'm1',
          amount: 12.34,
          description: 'Amazon purchase',
          purchase_date: '2025-10-18T00:00:00Z',
        },
      ],
    }
    // console.log('[ConstellationGraph] running sample analyze')
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample) })
      const data = await res.json()
      // console.log('[ConstellationGraph] sample response keys:', Object.keys(data || {}))
      // console.log('[ConstellationGraph] sample debug.rawText (truncated):', (data?.debug?.rawText || '').toString().slice(0,4000))

      // run the same normalization+node build used in the main effect
      let normalized = normalizeAnalyzeResponse(data?.classified || data)
      if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.parsed) normalized = normalizeAnalyzeResponse(data.debug.parsed)
      if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.rawText) {
        try {
          const txt = (data.debug.rawText || '').toString()
          const firstBrace = txt.indexOf('{')
          const lastBrace = txt.lastIndexOf('}')
          const firstBracket = txt.indexOf('[')
          const lastBracket = txt.lastIndexOf(']')
          let candidate: string | null = null
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) candidate = txt.slice(firstBrace, lastBrace+1)
          else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) candidate = txt.slice(firstBracket, lastBracket+1)
          if (candidate) {
            const parsedAgain = JSON.parse(candidate)
            const normalized2 = normalizeAnalyzeResponse(parsedAgain)
            if (normalized2.classified && normalized2.classified.length > 0) normalized = normalized2
          }
        } catch (e) { console.warn('sample rawText parse failed', e) }
      }

      // console.log('[ConstellationGraph] sample classified length:', normalized.classified.length)

      // populate refs so the animation picks it up
      const merchantsMap = new Map<string, any>()
      normalized.classified.forEach((c: ClassifiedItem) => {
        const mid = c.merchant_id || c.purchase_id || 'unknown'
        const existing = merchantsMap.get(mid) || { id: mid, name: c.description || mid, connections: [], spendVolume: 0, recency: 0, priority: 0 }
        existing.spendVolume = (existing.spendVolume || 0) + (c.amount || 0)
        merchantsMap.set(mid, existing)
      })
      const merchantEntries = Array.from(merchantsMap.values())
      // sanitize merchant node fields to safe ranges so drawing logic doesn't break
      const merchantNodes = merchantEntries.map((m, i) => {
        const sanitizedPriority = Math.max(0, Math.min(1, (m.priority ?? m.confidence ?? 0.5)))
        const sanitizedRecency = Math.max(0, Math.min(1, (m.recency ?? 0.5)))
        const sanitizedSpend = Math.max(0, (m.spendVolume ?? 0))
        // Use larger grid with more spread
        const cols = Math.ceil(Math.sqrt(merchantEntries.length))
        const spacing = 140 / Math.max(1, cols - 1)
        const col = i % cols
        const row = Math.floor(i / cols)
        const jitterX = (Math.random() - 0.5) * 12
        const jitterY = (Math.random() - 0.5) * 12
        const baseX = 10 + col * spacing + jitterX
        const baseY = 10 + row * spacing + jitterY
        const px = Math.max(3, Math.min(97, (m.px ?? baseX)))
        const py = Math.max(3, Math.min(97, (m.py ?? baseY)))
        const nodeType = (m.type === 'subscription' || m.type === 'category' || m.type === 'goal') ? m.type : 'merchant'
        return {
          ...m,
          type: nodeType,
          phase: Math.random() * Math.PI * 2,
          ampX: 2 + Math.random() * 3,
          ampY: 2 + Math.random() * 3,
          px,
          py,
          priority: sanitizedPriority,
          recency: sanitizedRecency,
          spendVolume: sanitizedSpend,
        }
      })
      const categoriesMap = new Map<string, any>()
      normalized.classified.forEach((c: ClassifiedItem) => {
        const catKey = c.category || 'Unknown'
        if (!categoriesMap.has(catKey)) categoriesMap.set(catKey, { id: `cat-${categoriesMap.size}`, name: catKey, connections: [], spendVolume: 0 })
        const node = categoriesMap.get(catKey)
        node.spendVolume += c.amount || 0
        const mid = c.merchant_id || c.purchase_id || ''
        if (mid && !node.connections.includes(mid)) node.connections.push(mid)
      })
      const cats = Array.from(categoriesMap.values()).map((c) => ({ ...c, x: 15+Math.random()*120, y: 15+Math.random()*120 }))

      nodesRef.current = merchantNodes
      categoriesRef.current = cats
      setIsLoading(false)
      // console.log('[ConstellationGraph] sample populated nodes:', merchantNodes.length, 'cats:', cats.length)
    } catch (e) {
      console.warn('sample analyze failed', e)
    }
  }

  // Fetch classifications once on mount. Show loading until populated.
  useEffect(() => {
    let cancelled = false
    const doFetch = async () => {
      setIsLoading(true)
      try {
        // console.log('[ConstellationGraph] starting /api/analyze fetch')
        // For now we send an empty transactions array; backend may accept this or return sample
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: [] }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        // console.log('[ConstellationGraph] /api/analyze returned (first level keys):', data && typeof data === 'object' ? Object.keys(data) : typeof data)
        // debug: log debug.rawText if present
        if (data && data.debug) {
          try {
            // console.log('[ConstellationGraph] debug.rawText (truncated):', (data.debug.rawText || '').toString().slice(0,2000))
          } catch (e) {}
          try {
            // console.log('[ConstellationGraph] debug.parsed keys:', data.debug.parsed ? Object.keys(data.debug.parsed) : null)
          } catch (e) {}
        }

        // Try normalization from several plausible places
        let normalized = normalizeAnalyzeResponse(data?.classified || data)
        // console.log('[ConstellationGraph] normalized.classified length (initial):', Array.isArray(normalized.classified) ? normalized.classified.length : 'not-array')

        // fallback: if normalized empty, try debug.parsed
        if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.parsed) {
          // console.log('[ConstellationGraph] fallback: normalizing data.debug.parsed')
          normalized = normalizeAnalyzeResponse(data.debug.parsed)
          // console.log('[ConstellationGraph] normalized.classified length (from debug.parsed):', normalized.classified.length)
        }

        // fallback: try parsing debug.rawText as JSON (strip fences) on client side
        if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.rawText) {
          try {
            // naive attempt: look for first { or [ and parse substring
            const txt = (data.debug.rawText || '').toString()
            const firstBrace = txt.indexOf('{')
            const lastBrace = txt.lastIndexOf('}')
            const firstBracket = txt.indexOf('[')
            const lastBracket = txt.lastIndexOf(']')
            let candidate: string | null = null
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) candidate = txt.slice(firstBrace, lastBrace+1)
            else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) candidate = txt.slice(firstBracket, lastBracket+1)
            if (candidate) {
              try {
                const parsedAgain = JSON.parse(candidate)
                const normalized2 = normalizeAnalyzeResponse(parsedAgain)
                // console.log('[ConstellationGraph] normalized.classified length (from debug.rawText):', normalized2.classified.length)
                if (normalized2.classified && normalized2.classified.length > 0) normalized = normalized2
              } catch (e) { 
                // console.log('[ConstellationGraph] client-side rawText parse failed') 
                }
            }
          } catch (e) { 
            // console.log('[ConstellationGraph] client-side debug.rawText fallback failed') 
          }
        }
        const classifiedArray: ClassifiedItem[] = normalized.classified || []

        // Build merchant nodes from classified transactions (group by merchant_id)
        const merchantsMap = new Map<string, any>()
        classifiedArray.forEach((c) => {
          const mid = c.merchant_id || c.purchase_id || 'unknown'
          const existing = merchantsMap.get(mid) || {
            id: mid,
            name: c.description || mid,
            type: 'merchant',
            connections: [] as string[],
            spendVolume: 0,
            recency: 0,
            priority: 0,
          }
          existing.spendVolume = (existing.spendVolume || 0) + (c.amount || 0)
          try {
            const ts = new Date(c.purchase_date).getTime()
            existing.recency = Math.max(existing.recency || 0, ts / Date.now())
          } catch (e) {}
          existing.priority = Math.max(existing.priority || 0, c.confidence || 0)
          merchantsMap.set(mid, existing)
        })

        const merchantEntries = Array.from(merchantsMap.values())
        const mCnt = merchantEntries.length
        const cols2 = Math.ceil(Math.sqrt(Math.max(1, mCnt)))
        const spacing2 = 140 / Math.max(1, cols2 - 1)  // Increased from 80 to 140 for more spacing
        // sanitize merchant nodes to ensure drawing math stays in safe ranges
        const merchantNodes = merchantEntries.map((m: any, i: number) => {
          const col = i % cols2
          const row = Math.floor(i / cols2)
          const jitterX = (Math.random() - 0.5) * 12  // Increased jitter for more spread
          const jitterY = (Math.random() - 0.5) * 12  // Increased jitter for more spread
          const baseX = 10 + col * spacing2 + jitterX
          const baseY = 10 + row * spacing2 + jitterY
          const sanitizedPriority = Math.max(0, Math.min(1, (m.priority ?? m.confidence ?? 0.5)))
          const sanitizedRecency = Math.max(0, Math.min(1, (m.recency ?? 0.5)))
          const sanitizedSpend = Math.max(0, (m.spendVolume ?? 0))
          const px = Math.max(3, Math.min(97, baseX))  // Adjusted bounds for larger grid
          const py = Math.max(3, Math.min(97, baseY))  // Adjusted bounds for larger grid
          return {
            id: m.id,
            name: m.name || m.id,
            type: 'merchant',
            x: baseX,
            y: baseY,
            connections: m.connections || [],
            spendVolume: sanitizedSpend,
            recency: sanitizedRecency,
            priority: sanitizedPriority,
            phase: Math.random() * Math.PI * 2,
            ampX: 2 + Math.random() * 3,
            ampY: 2 + Math.random() * 3,
            px,
            py,
          }
        })

        // Build category nodes
        const categoriesMap = new Map<string, any>()
        classifiedArray.forEach((c) => {
          const catKey = c.category || 'Unknown'
          if (!categoriesMap.has(catKey)) {
            const idx = categoriesMap.size
            categoriesMap.set(catKey, {
              id: `cat-${idx}`,
              name: catKey,
              type: 'category',
              x: 15 + (idx % 4) * 30,  // Increased spacing for categories
              y: 15 + Math.floor(idx / 4) * 28,  // Increased spacing for categories
              connections: [],
              spendVolume: 0,
              recency: 0.5,
              priority: 0.6,
            })
          }
          const node = categoriesMap.get(catKey)
          node.spendVolume += c.amount || 0
          const mid = c.merchant_id || c.purchase_id || ''
          if (mid && !node.connections.includes(mid)) node.connections.push(mid)
        })

        const cats = Array.from(categoriesMap.values()).map((c) => ({
          ...c,
          x: 15 + Math.random() * 120,  // Increased spread for categories
          y: 15 + Math.random() * 120,  // Increased spread for categories
        }))

  if (cancelled) return
  // console.log('[ConstellationGraph] built', merchantNodes.length, 'merchantNodes and', cats.length, 'categories')

        // ensure connectivity: compute minimal spanning edges between components (optional)
        const allNodes = [...merchantNodes.map((m) => ({ id: m.id, x: m.px || m.x, y: m.py || m.y })), ...cats.map((c) => ({ id: c.id, x: c.x, y: c.y }))]
        const idxMap = new Map<string, number>()
        allNodes.forEach((n, i) => idxMap.set(n.id, i))
        const parent = new Array(allNodes.length).fill(0).map((_, i) => i)
        const find = (a: number): number => parent[a] === a ? a : (parent[a] = find(parent[a]))
        const union = (a: number, b: number) => { const pa = find(a); const pb = find(b); if (pa !== pb) parent[pa] = pb }
        cats.forEach((c) => {
          c.connections.forEach((mid: string) => {
            const a = idxMap.get(c.id)
            const b = idxMap.get(mid)
            if (a !== undefined && b !== undefined) union(a, b)
          })
        })
        const dist = (a: any, b: any) => Math.hypot((a.x - b.x), (a.y - b.y))
        const spanningEdges: Array<[string, string]> = []
        const components = () => new Set(parent.map((_, i) => find(i)))
        while (components().size > 1) {
          let best: { d: number, aIdx: number, bIdx: number } | null = null
          for (let i = 0; i < allNodes.length; i++) {
            for (let j = i+1; j < allNodes.length; j++) {
              if (find(i) === find(j)) continue
              const d = dist(allNodes[i], allNodes[j])
              if (!best || d < best.d) best = { d, aIdx: i, bIdx: j }
            }
          }
          if (!best) break
          union(best.aIdx, best.bIdx)
          const aId = allNodes[best.aIdx].id
          const bId = allNodes[best.bIdx].id
          spanningEdges.push([aId, bId])
        }

        // write to refs used by animation
  nodesRef.current = merchantNodes
  categoriesRef.current = cats

        // store spanning edges so drawing picks them up
        // @ts-ignore
        ;(window as any).__spanningEdges = spanningEdges

        setIsLoading(false)
        // console.log('[ConstellationGraph] setIsLoading(false)')
      } catch (e) {
        console.warn('analyze fetch failed', e)
        if (!cancelled) setIsLoading(false)
      }
    }

    doFetch()
    return () => { cancelled = true }
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

    // Check merchant nodes first
    const nodes = nodesRef.current || []
    let clicked: any = null
    for (const n of nodes) {
      const x = (n.px / 100) * canvas.width + Math.sin(Date.now() / 1000 + n.phase) * n.ampX
      const y = (n.py / 100) * canvas.height + Math.cos(Date.now() / 1000 + n.phase) * n.ampY
      const baseRadius = 6 + (n.spendVolume / 500) * 2
      const radius = Math.min(baseRadius, 12)
      const distance = Math.hypot(clickX - x, clickY - y)
      if (distance <= radius + 5) {
        clicked = n
        break
      }
    }

    // If no merchant was clicked, check category nodes
    if (!clicked) {
      const cats = categoriesRef.current || []
      for (const c of cats) {
        const x = (c.x / 100) * canvas.width
        const y = (c.y / 100) * canvas.height
        const radius = Math.min(14, 6 + c.spendVolume / 500)
        const distance = Math.hypot(clickX - x, clickY - y)
        if (distance <= radius + 5) {
          clicked = c
          break
        }
      }
    }

    setSelectedMerchant(clicked || null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // check animated merchant nodes first
    const nodes = nodesRef.current || []
    let found: any = null
    for (const n of nodes) {
      const x = (n.px / 100) * canvas.width + Math.sin(Date.now() / 1000 + n.phase) * n.ampX
      const y = (n.py / 100) * canvas.height + Math.cos(Date.now() / 1000 + n.phase) * n.ampY
      const baseRadius = 6 + (n.spendVolume / 500) * 2
      const radius = Math.min(baseRadius, 12)
      const distance = Math.hypot(mouseX - x, mouseY - y)
      if (distance <= radius + 6) {
        found = n
        break
      }
    }

    // if merchant found, set hover and return
    if (found) {
      hoveredMerchantRef.current = found.id
      setHoveredMerchant(found.id)
      // debug
      // console.log intentionally left sparse to avoid spamming raf loop; log only when changed
      console.log('[ConstellationGraph] hover merchant id=', found.id)
      return
    }

    // otherwise check category nodes
    const cats = categoriesRef.current || []
    let foundCat: any = null
    for (const c of cats) {
      const x = (c.x / 100) * canvas.width
      const y = (c.y / 100) * canvas.height
      const radius = Math.min(14, 6 + c.spendVolume / 500)
      const distance = Math.hypot(mouseX - x, mouseY - y)
      if (distance <= radius + 6) {
        foundCat = c
        break
      }
    }

    if (foundCat) {
      hoveredMerchantRef.current = foundCat.id
      setHoveredMerchant(foundCat.id)
      console.log('[ConstellationGraph] hover category id=', foundCat.id)
      return
    }

    hoveredMerchantRef.current = null
    setHoveredMerchant(null)
    // debug
    // console.log('[ConstellationGraph] hover cleared')
  }

  return (
    <div className="px-4 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">Financial Constellation</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Your spending network mapped</p>
          <button
            type="button"
            onClick={runSample}
            className="text-xs px-2 py-1 rounded bg-accent/10 hover:bg-accent/20"
          >
            Run sample analyze
          </button>
        </div>
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

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="bg-black/40 rounded-md p-3 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full animate-spin border-2 border-white/80 border-t-transparent" />
                  <div className="text-white text-sm">Classifying transactions...</div>
                </div>
              </div>
            )}

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

        {!isLoading && selectedMerchant && (
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
        {Object.entries(TYPE_COLOR_MAP).map(([typeKey, color]) => (
          <div key={typeKey} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-muted-foreground">{typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
