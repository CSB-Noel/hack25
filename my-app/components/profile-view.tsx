"use client"

import { Settings, Bell, Moon, Zap, HelpCircle, LogOut, User, Mail, Shield, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function ProfileView() {
  return (
    <>
    <div className="px-4 max-w-md mx-auto pb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Profile</h2>

        {/* User Info Card */}
        <Card className="p-4 bg-card border-border mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Alex Morgan</h3>
              <p className="text-sm text-muted-foreground">alex.morgan@email.com</p>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-2xl font-bold text-primary">$4.2K</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-2xl font-bold text-[#35e0b4]">$287</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-2xl font-bold text-primary">4</p>
            <p className="text-xs text-muted-foreground">Goals</p>
          </Card>
        </div>
      </div>

      {/* Settings Sections */}
      {/* <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Preferences</h3>
          <Card className="bg-card border-border divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Notifications</p>
                  <p className="text-xs text-muted-foreground">Price changes & bill reminders</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Always on</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Smart Insights</p>
                  <p className="text-xs text-muted-foreground">AI-powered money moves</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Mask Amounts</p>
                  <p className="text-xs text-muted-foreground">Hide on screenshots</p>
                </div>
              </div>
              <Switch />
            </div>
          </Card>
        </div> */}

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Connections</h3>
          <Card className="bg-card border-border divide-y divide-border">
            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Email Accounts</p>
                <p className="text-xs text-muted-foreground">Gmail connected</p>
              </div>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Bank Accounts</p>
                <p className="text-xs text-muted-foreground">Capital One Savor</p>
              </div>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Privacy & Security</p>
                <p className="text-xs text-muted-foreground">Manage your data</p>
              </div>
            </button>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Support</h3>
          <Card className="bg-card border-border divide-y divide-border">
            {/* <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Help Center</p>
                <p className="text-xs text-muted-foreground">FAQs and guides</p>
              </div>
            </button> */}
            <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-destructive">
              <LogOut className="w-5 h-5" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">Log out of your account</p>
              </div>
            </button>
          </Card>
        </div>
      </div> 
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">StellarFinance v1.0.0</p>
      </div>
    </>
  )
}
