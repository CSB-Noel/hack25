"use client"

import { Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold">StellarFinance</h1>
        </div>

        <div className="flex-1">
          <Input placeholder="Search transactions…" className="bg-card border-border text-sm h-10" />
        </div>
      </div>
    </header>
  )
}
