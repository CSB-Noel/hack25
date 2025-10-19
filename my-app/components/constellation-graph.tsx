"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { RawTransaction, ClassifiedItem } from "../lib/analysis"
import { normalizeAnalyzeResponse } from "../lib/analysis"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useStore } from "@/app/store"

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
  transactionCount?: number
}


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
  
  // Use shared store for data caching
  const { analyzedData, setAnalyzedData, isDataLoading } = useStore()

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

      // collect edges from category->category connections
      const edges: Array<[string, string]> = []
      currentNodes.forEach((node: any) => {
        (node.connections || []).forEach((otherId: string) => edges.push([node.id, otherId]))
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
        const na = currentNodes.find((n: any) => n.id === a)
        const nb = currentNodes.find((n: any) => n.id === b)
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

      // Draw category nodes with subtle motion and hover/pulse effects
      let foundHover = false
      const categoryNodes = nodesRef.current || []
      categoryNodes.forEach((cat: any) => {
        const node = cat
        const x = (node.px / 100) * canvas.width + Math.sin(t + node.phase) * node.ampX
        const y = (node.py / 100) * canvas.height + Math.cos(t + node.phase) * node.ampY
        
        // Make category nodes larger based on spend volume
        const baseRadius = 8 + (cat.spendVolume / 300) * 3
        const radius = Math.min(baseRadius, 18)

        // Outer glow for ALL category nodes (always visible, brighter on hover)
        const currentHover = hoveredMerchantRef.current
        const isHovered = currentHover === cat.id
        const glowIntensity = isHovered ? 0.5 : 0.3
        const glowRadius = radius + 10
        
        ctx.beginPath()
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
        
        // Use the category's actual color for its glow
        const catColor = CATEGORY_COLOR_MAP[cat.name] || TYPE_COLOR_MAP.category
        const r = parseInt(catColor.slice(1, 3), 16)
        const g = parseInt(catColor.slice(3, 5), 16)
        const b = parseInt(catColor.slice(5, 7), 16)
        
        const gradient = ctx.createRadialGradient(x, y, radius, x, y, glowRadius)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowIntensity})`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw the category circle
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isHovered ? brighten(catColor, 0.15) : catColor
        ctx.fill()

        // Border
        ctx.strokeStyle = isHovered ? "#e6ecf8" : "rgba(230, 236, 248, 0.28)"
        ctx.lineWidth = isHovered ? 2.5 : 1.5
        ctx.stroke()

        // Pulse animation for recent activity (softer)
        if (cat.recency > 0.9) {
          const pulseRadius = radius + 4 + Math.sin(Date.now() / 400) * 2
          ctx.beginPath()
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `${catColor}40`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // hover label for category nodes - use CATEGORY_LABEL_MAP for friendly names
        if (hoveredMerchantRef.current === cat.id) {
          foundHover = true
          
          const displayName = CATEGORY_LABEL_MAP[cat.name] || cat.name
          const labelPaddingX = 12
          const charWidth = 7
          const estWidth = (displayName || '').toString().length * charWidth + labelPaddingX
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

          const newLabel = { x: lx, y: ly, name: displayName }
          const prev = hoverLabelRef.current
          if (!prev || prev.name !== newLabel.name || Math.hypot(prev.x - newLabel.x, prev.y - newLabel.y) > 0.5) {
            hoverLabelRef.current = newLabel
            setHoverLabel(newLabel)
          }
        }
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

      // Build category nodes - aggregate ALL transactions by category
      const categoriesMap = new Map<string, any>()
      normalized.classified.forEach((c: ClassifiedItem) => {
        const catKey = c.category || 'Unknown'
        if (!categoriesMap.has(catKey)) {
          categoriesMap.set(catKey, { 
            id: `cat-${categoriesMap.size}`, 
            name: catKey, 
            type: 'category',
            connections: [], 
            spendVolume: 0, 
            recency: 0, 
            priority: 0,
            transactionCount: 0,
          })
        }
        const node = categoriesMap.get(catKey)
        node.spendVolume += c.amount || 0
        node.transactionCount += 1
        
        // Update recency to most recent transaction
        try {
          const ts = new Date(c.purchase_date).getTime()
          node.recency = Math.max(node.recency || 0, ts / Date.now())
        } catch (e) {}
        
        // Update priority
        node.priority = Math.max(node.priority || 0, c.confidence || 0)
      })
      
      const categoryEntries = Array.from(categoriesMap.values())
      
      // Randomize positions and resolve overlaps
      const assignedPositions: Array<{x: number, y: number}> = []
      const minDist = 24 // minimum pixel distance between nodes
      const maxTries = 100
      const cols = Math.ceil(Math.sqrt(categoryEntries.length))
      const rows = Math.ceil(categoryEntries.length / cols)
      const spacingX = 75 / Math.max(1, cols - 1)
      const spacingY = 75 / Math.max(1, rows - 1)
      const categoryNodes = categoryEntries.map((cat, i) => {
        let tries = 0
        let px, py, baseX, baseY
        do {
          const col = i % cols
          const row = Math.floor(i / cols)
          const jitterX = (Math.random() - 0.5) * 18
          const jitterY = (Math.random() - 0.5) * 18
          baseX = 12 + col * spacingX + jitterX
          baseY = 12 + row * spacingY + jitterY
          px = Math.max(8, Math.min(92, baseX))
          py = Math.max(8, Math.min(92, baseY))
          // Check for overlap with previous nodes
          let overlap = false
          for (const pos of assignedPositions) {
            if (Math.hypot(pos.x - px, pos.y - py) < minDist) {
              overlap = true
              break
            }
          }
          if (!overlap) break
          tries++
        } while (tries < maxTries)
        assignedPositions.push({x: px, y: py})
        const sanitizedPriority = Math.max(0, Math.min(1, (cat.priority ?? 0.5)))
        const sanitizedRecency = Math.max(0, Math.min(1, (cat.recency ?? 0.5)))
        const sanitizedSpend = Math.max(0, (cat.spendVolume ?? 0))
        return {
          ...cat,
          phase: Math.random() * Math.PI * 2,
          ampX: 2 + Math.random() * 3,
          ampY: 2 + Math.random() * 3,
          px,
          py,
          x: baseX,
          y: baseY,
          priority: sanitizedPriority,
          recency: sanitizedRecency,
          spendVolume: sanitizedSpend,
        }
      })
      
      // Create proximity-based connections between category nodes
      const connectionsPerNode = new Map<string, Set<string>>()
      
      categoryNodes.forEach(node => {
        const distances: Array<{ id: string, dist: number }> = []
        categoryNodes.forEach(other => {
          if (node.id === other.id) return
          const dx = (node.px || node.x) - (other.px || other.x)
          const dy = (node.py || node.y) - (other.py || other.y)
          const dist = Math.hypot(dx, dy)
          distances.push({ id: other.id, dist })
        })
        
        distances.sort((a, b) => a.dist - b.dist)
        const numConnections = Math.min(2 + Math.floor(Math.random() * 3), distances.length)
        
        if (!connectionsPerNode.has(node.id)) {
          connectionsPerNode.set(node.id, new Set())
        }
        
        for (let i = 0; i < numConnections; i++) {
          const targetId = distances[i].id
          connectionsPerNode.get(node.id)!.add(targetId)
          if (!connectionsPerNode.has(targetId)) {
            connectionsPerNode.set(targetId, new Set())
          }
          connectionsPerNode.get(targetId)!.add(node.id)
        }
      })
      
      // Update category node connections from proximity algorithm
      categoryNodes.forEach(c => {
        const newConnections = Array.from(connectionsPerNode.get(c.id) || [])
        c.connections = newConnections
      })

      nodesRef.current = categoryNodes
      categoriesRef.current = []
      setIsLoading(false)
      // console.log('[ConstellationGraph] sample populated category nodes:', categoryNodes.length)
    } catch (e) {
      console.warn('sample analyze failed', e)
    }
  }

  // Fetch classifications once on mount. Show loading until populated.
  useEffect(() => {
    let cancelled = false
    
    // Helper function to process and build nodes from classified data
    const buildNodesFromData = (classifiedArray: ClassifiedItem[]) => {
      // Build category nodes - aggregate ALL transactions by category
      const categoriesMap = new Map<string, any>()
      classifiedArray.forEach((c) => {
        const catKey = c.category || 'Unknown'
        if (!categoriesMap.has(catKey)) {
          categoriesMap.set(catKey, {
            id: `cat-${categoriesMap.size}`,
            name: catKey,
            type: 'category',
            connections: [],
            spendVolume: 0,
            recency: 0,
            priority: 0,
            transactionCount: 0,
          })
        }
        const node = categoriesMap.get(catKey)
        node.spendVolume += c.amount || 0
        node.transactionCount += 1
        
        // Update recency to most recent transaction
        try {
          const ts = new Date(c.purchase_date).getTime()
          node.recency = Math.max(node.recency || 0, ts / Date.now())
        } catch (e) {}
        
        // Update priority
        node.priority = Math.max(node.priority || 0, c.confidence || 0)
      })

      const categoryEntries = Array.from(categoriesMap.values())
      const catCnt = categoryEntries.length
      const cols = Math.ceil(Math.sqrt(Math.max(1, catCnt)))
      const rows = Math.ceil(catCnt / cols)
      // Increase spacing to spread category nodes across the canvas
      const spacingX = 75 / Math.max(1, cols - 1)
      const spacingY = 75 / Math.max(1, rows - 1)
      
      // Randomize positions and resolve overlaps
      const assignedPositions: Array<{x: number, y: number}> = []
      const minDist = 24 // minimum pixel distance between nodes
      const maxTries = 100
      const cats = categoryEntries.map((cat: any, i: number) => {
        let tries = 0
        let px, py, baseX, baseY
        do {
          const col = i % cols
          const row = Math.floor(i / cols)
          const jitterX = (Math.random() - 0.5) * 18
          const jitterY = (Math.random() - 0.5) * 18
          baseX = 12 + col * spacingX + jitterX
          baseY = 12 + row * spacingY + jitterY
          px = Math.max(8, Math.min(92, baseX))
          py = Math.max(8, Math.min(92, baseY))
          // Check for overlap with previous nodes
          let overlap = false
          for (const pos of assignedPositions) {
            if (Math.hypot(pos.x - px, pos.y - py) < minDist) {
              overlap = true
              break
            }
          }
          if (!overlap) break
          tries++
        } while (tries < maxTries)
        assignedPositions.push({x: px, y: py})
        const sanitizedPriority = Math.max(0, Math.min(1, (cat.priority ?? 0.5)))
        const sanitizedRecency = Math.max(0, Math.min(1, (cat.recency ?? 0.5)))
        const sanitizedSpend = Math.max(0, (cat.spendVolume ?? 0))
        return {
          ...cat,
          x: baseX,
          y: baseY,
          px,
          py,
          spendVolume: sanitizedSpend,
          recency: sanitizedRecency,
          priority: sanitizedPriority,
          phase: Math.random() * Math.PI * 2,
          ampX: 2 + Math.random() * 3,
          ampY: 2 + Math.random() * 3,
        }
      })

      // Create proximity-based connections between category nodes
      const connectionsPerNode = new Map<string, Set<string>>()
      
      cats.forEach(node => {
        // Calculate distances to all other category nodes
        const distances: Array<{ id: string, dist: number }> = []
        cats.forEach(other => {
          if (node.id === other.id) return
          const dx = (node.px || node.x) - (other.px || other.x)
          const dy = (node.py || node.y) - (other.py || other.y)
          const dist = Math.hypot(dx, dy)
          distances.push({ id: other.id, dist })
        })
        
        // Sort by distance and connect to 2-4 nearest neighbors
        distances.sort((a, b) => a.dist - b.dist)
        const numConnections = Math.min(2 + Math.floor(Math.random() * 3), distances.length)
        
        if (!connectionsPerNode.has(node.id)) {
          connectionsPerNode.set(node.id, new Set())
        }
        
        for (let i = 0; i < numConnections; i++) {
          const targetId = distances[i].id
          // Add bidirectional connection
          connectionsPerNode.get(node.id)!.add(targetId)
          if (!connectionsPerNode.has(targetId)) {
            connectionsPerNode.set(targetId, new Set())
          }
          connectionsPerNode.get(targetId)!.add(node.id)
        }
      })
      
      // Update category node connections from proximity algorithm
      cats.forEach(c => {
        const newConnections = Array.from(connectionsPerNode.get(c.id) || [])
        c.connections = newConnections
      })

      // write to refs used by animation - now only category nodes, no merchant nodes
      nodesRef.current = cats
      categoriesRef.current = []
    }
    
    const doFetch = async () => {
      // Check if we have cached data
      if (analyzedData) {
        console.log('[ConstellationGraph] Using cached data')
        buildNodesFromData(analyzedData)
        setIsLoading(false)
        return
      }
      
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

        // Try normalization from several plausible places
        let normalized = normalizeAnalyzeResponse(data?.classified || data)

        // fallback: if normalized empty, try debug.parsed
        if ((!normalized.classified || normalized.classified.length === 0) && data?.debug?.parsed) {
          normalized = normalizeAnalyzeResponse(data.debug.parsed)
        }

        // fallback: try parsing debug.rawText as JSON (strip fences) on client side
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
              try {
                const parsedAgain = JSON.parse(candidate)
                const normalized2 = normalizeAnalyzeResponse(parsedAgain)
                if (normalized2.classified && normalized2.classified.length > 0) normalized = normalized2
              } catch (e) {}
            }
          } catch (e) {}
        }
        const classifiedArray: ClassifiedItem[] = normalized.classified || []
        
        // Cache the data in the store
        setAnalyzedData(classifiedArray)

        if (cancelled) return
        
        buildNodesFromData(classifiedArray)

        setIsLoading(false)
        // console.log('[ConstellationGraph] setIsLoading(false)')
      } catch (e) {
        console.warn('analyze fetch failed', e)
        if (!cancelled) setIsLoading(false)
      }
    }

    doFetch()
    return () => { cancelled = true }
  }, [analyzedData, setAnalyzedData])


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

    // Check category nodes (now the only nodes)
    const categoryNodes = nodesRef.current || []
    let clicked: any = null
    for (const cat of categoryNodes) {
      const x = (cat.px / 100) * canvas.width + Math.sin(Date.now() / 1000 + cat.phase) * cat.ampX
      const y = (cat.py / 100) * canvas.height + Math.cos(Date.now() / 1000 + cat.phase) * cat.ampY
      const baseRadius = 8 + (cat.spendVolume / 300) * 3
      const radius = Math.min(baseRadius, 18)
      const distance = Math.hypot(clickX - x, clickY - y)
      if (distance <= radius + 5) {
        clicked = cat
        break
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

    // check category nodes (now the only nodes)
    const categoryNodes = nodesRef.current || []
    let foundCat: any = null
    for (const cat of categoryNodes) {
      const x = (cat.px / 100) * canvas.width + Math.sin(Date.now() / 1000 + cat.phase) * cat.ampX
      const y = (cat.py / 100) * canvas.height + Math.cos(Date.now() / 1000 + cat.phase) * cat.ampY
      const baseRadius = 8 + (cat.spendVolume / 300) * 3
      const radius = Math.min(baseRadius, 18)
      const distance = Math.hypot(mouseX - x, mouseY - y)
      if (distance <= radius + 6) {
        foundCat = cat
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
          {/* <button
            type="button"
            onClick={runSample}
            className="text-xs px-2 py-1 rounded bg-accent/10 hover:bg-accent/20"
          >
            Run sample analyze
          </button> */}
        </div>
      </div>

      <div className="relative">
  <Card className="bg-card/40 backdrop-blur-md border border-border overflow-hidden">
          <div className="relative h-[450px]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => { 
                hoveredMerchantRef.current = null
                setHoveredMerchant(null)
                hoverLabelRef.current = null
                setHoverLabel(null)
              }}
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
                <h3 className="font-semibold text-foreground">
                  {CATEGORY_LABEL_MAP[selectedMerchant.name] || selectedMerchant.name}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">{selectedMerchant.type}</p>
              </div>
              <Badge
                variant="secondary"
                style={{
                  background: `${(CATEGORY_COLOR_MAP[selectedMerchant.name] || TYPE_COLOR_MAP[selectedMerchant.type] || '#9fb3d1')}20`,
                  color: CATEGORY_COLOR_MAP[selectedMerchant.name] || TYPE_COLOR_MAP[selectedMerchant.type] || '#9fb3d1',
                  border: '1px solid ' + (CATEGORY_COLOR_MAP[selectedMerchant.name] || TYPE_COLOR_MAP[selectedMerchant.type] || '#9fb3d1'),
                }}
              >
                {/* {selectedMerchant.type} */}
                Color
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Total Spend
                </span>
                <span className="font-semibold text-foreground">${selectedMerchant.spendVolume.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-semibold text-foreground">{selectedMerchant.transactionCount || 0}</span>
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

      {/* <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        {Object.entries(TYPE_COLOR_MAP).map(([typeKey, color]) => (
          <div key={typeKey} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-muted-foreground">{typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}</span>
          </div>
        ))}
      </div> */}
    </div>
  )
}
