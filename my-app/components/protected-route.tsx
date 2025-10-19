"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { OnboardingModal } from "@/components/onboarding-modal"
import { useState, useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowOnboarding(true)
    }
  }, [isAuthenticated, isLoading])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <OnboardingModal 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete} 
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to Orion</h1>
            <p className="text-muted-foreground">Please complete onboarding to continue</p>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
