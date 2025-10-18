"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FinancialAnalysisDashboard } from "@/components/financial-analysis-dashboard"
import { ConstellationGraph } from "@/components/constellation-graph"
import { EmailDoomScroll } from "@/components/email-doom-scroll"
import { EmailChatbot } from "@/components/email-chatbot"
import { CalendarIntegration } from "@/components/calendar-integration"
import { TrendingUp, Network, Film, MessageSquare, Calendar, LogOut, User } from "lucide-react"

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("financial")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">FinMail</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => (window.location.href = "/")}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="financial" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Financial Analysis</span>
              <span className="sm:hidden">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="constellation" className="gap-2">
              <Network className="w-4 h-4" />
              <span className="hidden sm:inline">Constellation</span>
              <span className="sm:hidden">Graph</span>
            </TabsTrigger>
            <TabsTrigger value="scroll" className="gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Email Scroll</span>
              <span className="sm:hidden">Scroll</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chatbot</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <FinancialAnalysisDashboard />
          </TabsContent>

          <TabsContent value="constellation" className="space-y-6">
            <ConstellationGraph />
          </TabsContent>

          <TabsContent value="scroll" className="space-y-6">
            <EmailDoomScroll />
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <EmailChatbot />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarIntegration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
