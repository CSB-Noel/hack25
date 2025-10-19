"use client"

import { Sparkles, Map, List, Target, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/app/store"

interface BottomNavProps {
  activeTab: "feed" | "constellations" | "transactions" | "goals" | "profile"
  onTabChange: (tab: "feed" | "constellations" | "transactions" | "goals" | "profile") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { key: "feed" as const, icon: Sparkles, label: "Feed" },
    { key: "constellations" as const, icon: Map, label: "Map" },
    { key: "transactions" as const, icon: List, label: "Activity" },
    { key: "goals" as const, icon: Target, label: "Goals" },
    { key: "profile" as const, icon: User, label: "You" },
  ]

  const incrementSlideChangeTrigger = useStore((state) => state.incrementSlideChangeTrigger)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => {
                onTabChange(tab.key)
                incrementSlideChangeTrigger()
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-xl transition-all",
                isActive && "bg-primary/10",
              )}
            >
              <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
