"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, TrendingUp, Shield, Brain } from "lucide-react"

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    // Mock sign-in - in production, this would use Google OAuth
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-balance">Financial Insights from Your Inbox</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Automatically categorize emails, analyze spending patterns, and get AI-powered financial recommendations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Smart Categorization</h3>
                <p className="text-sm text-muted-foreground">AI-powered email organization</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Spending Analysis</h3>
                <p className="text-sm text-muted-foreground">Track receipts and expenses</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold">Fraud Detection</h3>
                <p className="text-sm text-muted-foreground">Identify suspicious payments</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <h3 className="font-semibold">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">Personalized financial advice</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl">Get Started</CardTitle>
            <CardDescription className="text-base">
              Connect your Gmail account to begin analyzing your financial data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleSignIn} disabled={isLoading} size="lg" className="w-full text-base h-12">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Secure & Private</span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              We use industry-standard encryption and never store your email passwords. Your data is processed securely
              and remains private.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
