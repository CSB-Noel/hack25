"use client"

import { useState } from "react"
import { StarfieldBackground } from "@/components/starfield-background"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { FeedView } from "@/components/feed-view"
import { ConstellationGraph } from "@/components/constellation-graph"
import { TransactionsView } from "@/components/transactions-view"
import { GoalsView } from "@/components/goals-view"
import { ProfileView } from "@/components/profile-view"
import { ProtectedRoute } from "@/components/protected-route"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "constellations" | "transactions" | "goals" | "profile">("feed")

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative">
        <StarfieldBackground />

        <div className="relative z-10">
          <MobileHeader />

          <main className="pb-24 pt-2">
            {activeTab === "feed" && <FeedView />}
            {activeTab === "constellations" && <ConstellationGraph />}
            {activeTab === "transactions" && <TransactionsView />}
            {activeTab === "goals" && <GoalsView />}
            {activeTab === "profile" && <ProfileView />}
          </main>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
