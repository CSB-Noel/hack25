"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface BlackholeZoneProps {
  isActive: boolean
  isNearBlackhole: boolean
  onDrop: () => void
}

export function BlackholeZone({ isActive, isNearBlackhole, onDrop }: BlackholeZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "fixed bottom-32 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none",
        isNearBlackhole && "scale-125"
      )}
    >
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl transition-all",
            isActive && "animate-pulse bg-destructive/30",
            isNearBlackhole && "animate-ping bg-destructive/50"
          )}
          style={{ transform: "scale(1.5)" }}
        />

        {/* Main blackhole */}
        <div
          className={cn(
            "relative w-32 h-32 rounded-full bg-gradient-to-br from-destructive/80 to-destructive flex items-center justify-center shadow-2xl border-4 border-destructive/50 transition-all",
            isActive && "scale-110",
            isNearBlackhole && "scale-125 animate-pulse"
          )}
        >
          {/* Inner void */}
          <div className="w-20 h-20 rounded-full bg-background/90 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background border-2 border-destructive/30" />
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <div className="absolute top-2 left-1/2 w-2 h-2 rounded-full bg-destructive/60" />
          </div>
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "4s", animationDirection: "reverse" }}
          >
            <div className="absolute bottom-2 left-1/2 w-1.5 h-1.5 rounded-full bg-destructive/40" />
          </div>
        </div>

        {/* Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className={cn(
            "text-sm font-semibold text-destructive transition-all",
            isNearBlackhole && "animate-pulse text-destructive/80"
          )}>
            {isNearBlackhole ? "Release to delete" : "Hold to delete"}
          </p>
        </div>
      </div>
    </div>
  )
}
