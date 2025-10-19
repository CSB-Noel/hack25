"use client"

import { Sparkles, LogOut, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import StarCrescentSolid from "./ui/star"

export function MobileHeader() {
  const { data: session } = useSession()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    setIsLogoutDialogOpen(false)
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="flex items-center gap-3  py-3 max-w-md mx-auto bg-background/80 backdrop-blur-xl">
        <div className="flex-1 flex items-center gap-2">
          <h1 className="text-lg title-font font-semibold">Pyxis</h1>
          <StarCrescentSolid size="24" />
        </div>

        <div className="flex-1">
          <Input placeholder="" className="border-0" disabled/>
        </div>

        {/* User menu */}
        <div className="flex-1 flex items-center justify-end">
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
      </div>
    </header>
  )
}
