"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Mail, Building2, ChevronRight, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OnboardingModalProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [connectedEmail, setConnectedEmail] = useState(false)
  const [connectedBank, setConnectedBank] = useState(false)
  const { data: session, status } = useSession()

  // Update connectedEmail state when session changes
  useEffect(() => {
    if (session?.user) {
      setConnectedEmail(true)
    }
  }, [session])

  const slides = [
    {
      title: "Your money, mapped",
      subtitle: "Connect email + bank to see your financial constellations.",
      icon: Sparkles,
      bg: "animated starfield",
    },
    {
      title: "AI key points",
      subtitle: "Bills, receipts, and alerts summarized at a glance.",
      icon: Sparkles,
      bg: "gradient",
    },
    {
      title: "Act instantly",
      subtitle: "Cancel waste, pay bills, move money — all in one swipe.",
      icon: Sparkles,
      bg: "gradient",
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Move to connection step
      setCurrentSlide(slides.length)
    }
  }

  const handleConnectEmail = async (provider: "google" | "microsoft") => {
    try {
      const result = await signIn(provider, { 
        redirect: false,
        callbackUrl: window.location.href 
      })
      
      if (result?.error) {
        console.error("Authentication error:", result.error)
      } else if (result?.ok) {
        // Authentication successful, session will be updated automatically
        console.log("Authentication successful")
      }
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }


  const handleConnectBank = () => {
    // In a real app, this would trigger Nessie/Plaid connection
    setConnectedBank(true)
  }

  const handleFinish = () => {
    onComplete()
  }

  if (currentSlide < slides.length) {
    const slide = slides[currentSlide]
    const Icon = slide.icon

    return (
      <Dialog open={open}>
        <DialogHeader>
          <DialogTitle> </DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden">
          <div className="relative h-[600px] flex flex-col">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-3">{slide.title}</h2>
              <p className="text-lg text-muted-foreground max-w-sm">{slide.subtitle}</p>
            </div>

            {/* Navigation */}
            <div className="relative z-10 p-6 bg-card/50 backdrop-blur-xl border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Connection step
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md bg-background border-border p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Link your email and bank to start mapping your financial constellations
            </p>
          </div>

          {/* Connection cards */}
          <div className="p-6 space-y-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">Email Account</h3>
                    {connectedEmail && (
                      <Badge variant="secondary" className="bg-[#35e0b4]/20 text-[#35e0b4]">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Read-only access to parse receipts and bills</p>
                  {!connectedEmail ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectEmail("google")}
                        className="flex-1 bg-transparent"
                      >
                        Gmail
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnectEmail("microsoft")}
                        className="flex-1 bg-transparent"
                      >
                        Outlook
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#35e0b4]">{session?.user?.email || "Connected"}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">Bank Account</h3>
                    {connectedBank && (
                      <Badge variant="secondary" className="bg-[#35e0b4]/20 text-[#35e0b4]">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Read transactions & balances; no money moves without consent
                  </p>
                  {!connectedBank ? (
                    <Button size="sm" variant="outline" onClick={handleConnectBank} className="w-full bg-transparent">
                      Connect Capital One
                    </Button>
                  ) : (
                    <p className="text-xs text-[#35e0b4]">Capital One Savor (••••4532)</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Privacy note */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your data is encrypted and never shared. We use read-only access to analyze your finances and provide
                insights. You can disconnect at any time.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <Button
              onClick={handleFinish}
              disabled={!connectedEmail || !connectedBank}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {connectedEmail && connectedBank ? "Start Exploring" : "Connect Both to Continue"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
