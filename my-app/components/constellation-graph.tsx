"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock email categories
const emailCategories = [
  { id: 1, name: "Receipts", count: 234, x: 50, y: 50, size: 60, color: "hsl(var(--chart-1))" },
  { id: 2, name: "Bills", count: 89, x: 150, y: 80, size: 45, color: "hsl(var(--chart-2))" },
  { id: 3, name: "Subscriptions", count: 156, x: 250, y: 60, size: 55, color: "hsl(var(--chart-3))" },
  { id: 4, name: "Shopping", count: 312, x: 120, y: 180, size: 70, color: "hsl(var(--chart-4))" },
  { id: 5, name: "Travel", count: 67, x: 280, y: 170, size: 40, color: "hsl(var(--chart-5))" },
  { id: 6, name: "Banking", count: 145, x: 200, y: 250, size: 52, color: "hsl(var(--chart-1))" },
  { id: 7, name: "Social", count: 423, x: 80, y: 280, size: 75, color: "hsl(var(--chart-2))" },
  { id: 8, name: "Work", count: 198, x: 320, y: 280, size: 58, color: "hsl(var(--chart-3))" },
]

export function ConstellationGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<(typeof emailCategories)[0] | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw connections
    ctx.strokeStyle = "rgba(128, 128, 128, 0.2)"
    ctx.lineWidth = 1
    emailCategories.forEach((cat1, i) => {
      emailCategories.slice(i + 1).forEach((cat2) => {
        const distance = Math.sqrt(Math.pow(cat2.x - cat1.x, 2) + Math.pow(cat2.y - cat1.y, 2))
        if (distance < 200) {
          ctx.beginPath()
          ctx.moveTo(cat1.x, cat1.y)
          ctx.lineTo(cat2.x, cat2.y)
          ctx.stroke()
        }
      })
    })

    // Draw nodes
    emailCategories.forEach((category) => {
      const isHovered = hoveredCategory === category.id
      const isSelected = selectedCategory?.id === category.id

      // Glow effect for hovered/selected
      if (isHovered || isSelected) {
        ctx.shadowBlur = 20
        ctx.shadowColor = category.color
      } else {
        ctx.shadowBlur = 0
      }

      // Draw circle
      ctx.fillStyle = category.color
      ctx.beginPath()
      ctx.arc(category.x, category.y, category.size / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = isHovered || isSelected ? "#fff" : "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = isHovered || isSelected ? 3 : 2
      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0
    })
  }, [hoveredCategory, selectedCategory])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clicked = emailCategories.find((cat) => {
      const distance = Math.sqrt(Math.pow(x - cat.x, 2) + Math.pow(y - cat.y, 2))
      return distance < cat.size / 2
    })

    setSelectedCategory(clicked || null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = emailCategories.find((cat) => {
      const distance = Math.sqrt(Math.pow(x - cat.x, 2) + Math.pow(y - cat.y, 2))
      return distance < cat.size / 2
    })

    setHoveredCategory(hovered?.id || null)
    canvas.style.cursor = hovered ? "pointer" : "default"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Constellation</h2>
        <p className="text-muted-foreground">Interactive visualization of your email categories</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Constellation</CardTitle>
            <CardDescription>Click on a category to view details. Size represents email volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-[400px] border border-border rounded-lg"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>All email categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedCategory?.id === category.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedCategory.name}</CardTitle>
                <CardDescription>Category details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Emails</p>
                  <p className="text-2xl font-bold">{selectedCategory.count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold">
                    {(
                      (selectedCategory.count / emailCategories.reduce((sum, cat) => sum + cat.count, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <Button className="w-full" onClick={() => (window.location.href = "/dashboard?tab=scroll")}>
                  View Emails
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
