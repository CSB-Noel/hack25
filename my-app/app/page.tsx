"use client"

import { useState, useEffect } from "react"
import { StarfieldBackground } from "@/components/starfield-background"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { FeedView } from "@/components/feed-view"
import { ConstellationGraph } from "@/components/constellation-graph"
import { TransactionsView } from "@/components/transactions-view"
import { GoalsView } from "@/components/goals-view"
import { ProfileView } from "@/components/profile-view"
import { OnboardingModal } from "@/components/onboarding-modal"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "constellations" | "transactions" | "goals" | "profile">("feed")
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("stellarfinance_onboarding_complete")
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("stellarfinance_onboarding_complete", "true")
    setShowOnboarding(false)
  }

  return (
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

      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  )
}
