"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/app/store"

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<
    Array<{ x: number; y: number; size: number; speed: number; opacity: number; vx: number; vy: number }>
  >([])

  const slideChangeTrigger = useStore((state) => state.slideChangeTrigger)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // initialize stars
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.3,
      vx: 0,
      vy: 0,
    }))
    starsRef.current = stars

    let animationId: number
    const animate = () => {
      ctx.fillStyle = "#070A13"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const star of starsRef.current) {
        // update positions
        star.x += star.vx
        star.y += star.vy

        // wrap around screen edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // draw
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230, 236, 248, ${star.opacity})`
        ctx.fill()

        // twinkle
        star.opacity += (Math.random() - 0.5) * 0.02
        star.opacity = Math.max(0.2, Math.min(0.8, star.opacity))

        // slow down diagonal zoom over time
        star.vx *= 0.95
        star.vy *= 0.95
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Trigger diagonal zoom whenever slideChangeTrigger changes
  useEffect(() => {
    const stars = starsRef.current
    for (const star of stars) {
      // give a short velocity burst diagonally (up-right)
      const diagonalSpeed = Math.random() * 5 + 2
      star.vx = diagonalSpeed
      star.vy = -diagonalSpeed
    }
  }, [slideChangeTrigger])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
}
