"use client"

import { Sparkles, LogOut, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function MobileHeader() {
  const { data: session } = useSession()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    setIsLogoutDialogOpen(false)
  }

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

        {/* User menu */}
        {session?.user && (
          <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <User className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{session.user.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  )
}
